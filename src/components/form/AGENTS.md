# Form System Guide

## Architecture

LocalJudge uses a custom form system built on TanStack Form with TypeBox validation integration. The system uses React contexts for field communication and a component registry pattern.

### Core Pattern
```typescript
const form = useAppForm({
  defaultValues: Value.Create(Model.insert),  // Generate defaults from schema
  validators: { onChange: Compile(Model.insert) },  // Compile TypeBox to validator
  onSubmit: async ({ value }) => { /* submit logic */ }
});
```

## Key Components

### 1. `useAppForm` Hook
Custom hook from `@/components/form/primitives` that wraps TanStack Form with:
- **Field context**: Enables field components to access their field state
- **Form context**: Provides form-level state and methods
- **Field components registry**: Pre-registered field types (TextField, NumberField, etc.)
- **Form components registry**: Utility components (SubmitButton)

### 2. Field Components
All field components use `useFieldContext()` to access field state:

```typescript
function TextField({ label, description, ...props }) {
  const field = useFieldContext<string>();  // Type-safe field access
  
  return (
    <Input
      id={field.name}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
    />
  );
}
```

**Available Fields**:
- `TextField` - string input
- `NumberField` - numeric input with step controls
- `DateTimePicker` - date/time selection with calendar
- `ToggleSwitch` - boolean toggle
- `TagsInput` - tag input field for string arrays
- `Textarea` - multi-line text input

### 3. Field Usage in Forms
Use `form.Field` with `name` and `children` render prop:

```typescript
<form.Field name="email">
  {(field) => (
    <form.TextField
      field={field}
      label="Email"
      type="email"
    />
  )}
</form.Field>
```

Or access directly for custom rendering:
```typescript
<form.Field name="custom">
  {(field) => (
    <div>
      <CustomComponent
        value={field.state.value}
        onChange={field.handleChange}
      />
      <FieldInfo field={field} />  {/* Show validation errors */}
    </div>
  )}
</form.Field>
```

## TypeBox Integration

### Value.Create vs Compile
- **`Value.Create(schema)`** - Generates default values for form initialization
  ```typescript
  defaultValues: Value.Create(ParticipantModel.insert)
  // { name: "", email: "", password: "" }
  ```

- **`Compile(schema)`** - Compiles TypeBox schema into a validator function
  ```typescript
  validators: { onChange: Compile(ParticipantModel.insert) }
  // Returns validator that checks against schema on every change
  ```

### Model Namespace Pattern
API models use namespaces with three schemas:
```typescript
export namespace ContestModel {
  export const select = createSelectSchema(contest, { ... });  // Read
  export const insert = createInsertSchema(contest, { ... });  // Create
  export const update = createUpdateSchema(contest, { ... });  // Update
}
```

Use **`insert`** for create forms, **`update`** for edit forms.

## Common Workflows

### Creating a Form
1. Import model and form utilities:
   ```typescript
   import { useAppForm } from "@/components/form/primitives";
   import { ContestModel } from "@/api/contest/model";
   import { Value } from "@sinclair/typebox/value";
   import { Compile } from "@sinclair/typemap";
   ```

2. Initialize form with TypeBox schema:
   ```typescript
   const form = useAppForm({
     defaultValues: Value.Create(ContestModel.insert),
     validators: { onChange: Compile(ContestModel.insert) },
     onSubmit: async ({ value }) => {
       const { error } = await localjudge.contest.post({ body: value });
       // handle error/success
     }
   });
   ```

3. Render fields using `form.Field`:
   ```typescript
   <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
     <form.Field name="name">
       {(field) => <form.TextField field={field} label="Name" />}
     </form.Field>
     <form.SubmitButton>Create</form.SubmitButton>
   </form>
   ```

### Validation Errors
- **Field-level errors**: Shown via `<FieldInfo field={field} />` component
- **Access errors**: `field.state.meta.errors` (array of error messages)
- **Form-level validation**: Happens on `onChange` (live) and `onSubmit`

### Edit Forms with Existing Data
```typescript
const form = useAppForm({
  defaultValues: existingContest,  // Pre-fill with existing data
  validators: { onChange: Compile(ContestModel.update) },  // Use update schema
  onSubmit: async ({ value }) => {
    await localjudge.contest[':id'].patch({ 
      params: { id: contestId },
      body: value 
    });
  }
});
```

## Gotchas

- **Must call `e.preventDefault()`** - Form submission needs `onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}`
- **Field names must match schema keys** - TypeScript will warn, but double-check
- **Validators run on every change** - Use `onChange` for live validation, `onSubmit` for validation only on submit
- **Custom fields need `useFieldContext()`** - Don't access field state from props
- **FieldInfo shows errors** - Include `<FieldInfo field={field} />` after inputs to display validation messages
- **DateTimePicker value is Date object** - Convert to/from ISO string as needed
- **TagsInput expects string[]** - Not comma-separated string
