import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

export const TITLE_MAX = 200;

export type CardFormValues = {
  title: string;
  description: string;
};

type CardFormProps = {
  mode: "create" | "edit";
  initialValues?: CardFormValues;
  onSubmit: (values: CardFormValues) => Promise<void>;
  onCancel: () => void;
};

const EMPTY: CardFormValues = { title: "", description: "" };

export function CardForm({
  mode,
  initialValues = EMPTY,
  onSubmit,
  onCancel,
}: CardFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  const isDirty =
    trimmedTitle !== initialValues.title ||
    trimmedDescription !== initialValues.description;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!trimmedTitle) {
      setTitleError("El título es obligatorio");
      titleRef.current?.focus();
      return;
    }

    setTitleError(null);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ title: trimmedTitle, description: trimmedDescription });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (
      e.key === "Enter" &&
      (e.ctrlKey || e.metaKey) &&
      e.target instanceof HTMLTextAreaElement
    ) {
      e.currentTarget.requestSubmit();
    }
  }

  const submitLabel = mode === "create" ? "Add card" : "Save";
  const submittingLabel = mode === "create" ? "Adding..." : "Saving...";

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      onKeyDown={handleKeyDown}
      noValidate
      className="card-form"
    >
      <div className="field">
        <label htmlFor="card-title">Title</label>
        <input
          id="card-title"
          ref={titleRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) {
              setTitleError(null);
            }
          }}
          maxLength={TITLE_MAX}
          disabled={isSubmitting}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "card-title-error" : undefined}
          placeholder="What needs to be done?"
        />
        <small>
          {title.length}/{TITLE_MAX}
        </small>
        {titleError && (
          <p id="card-title-error" role="alert" className="error">
            {titleError}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="card-description">Description</label>
        <textarea
          id="card-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          placeholder="Optional details..."
        />
      </div>

      {submitError && (
        <p role="alert" className="error">
          {submitError}
        </p>
      )}

      <div className="actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !trimmedTitle || (mode === "edit" && !isDirty)}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}