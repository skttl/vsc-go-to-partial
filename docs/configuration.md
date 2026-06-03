# Configuration

All settings are under the `goToPartial` namespace and can be configured in your VS Code `settings.json` (user or workspace level).

---

## `goToPartial.additionalTagHelperAttributes`

**Type:** `string[]`  
**Default:** `[]`

A list of additional HTML attribute names whose values should be treated as partial view names. Use this to support custom tag helpers that inherit from or wrap the built-in `<partial>` tag helper.

### When to use

If you have a custom tag helper like:

```csharp
[HtmlTargetElement("my-partial")]
public class MyPartialTagHelper : PartialTagHelper
{
    // ...
}
```

Used in markup as:

```html
<my-partial name="_MyView" />
```

The `name` attribute is **not** handled by default unless the element is literally `<partial>`. To support `<my-partial name="">`, add it to [`goToPartial.additionalPartialTagNames`](#goToPartialadditionalPartialTagNames) instead:

```jsonc
"goToPartial.additionalPartialTagNames": ["my-partial"]
```

If your custom tag helper uses a **different attribute name** (not `name`):

```html
<my-partial src="_MyView" />
<cached-partial view-name="_MyView" />
```

Add those attribute names to this setting:

```jsonc
"goToPartial.additionalTagHelperAttributes": ["src", "view-name"]
```

### Example — workspace `settings.json`

```jsonc
{
  "goToPartial.additionalTagHelperAttributes": [
    "src",
    "view-name",
    "partial-name"
  ]
}
```

With this configuration, the extension will treat the value of `src`, `view-name`, and `partial-name` attributes on any HTML element as a partial view name and attempt to navigate to the resolved file.

### Notes

- Attribute matching is case-insensitive
- The same resolution order and tilde-path handling applies as for built-in patterns
- This does **not** restrict matching to specific element names — all elements with the listed attribute names are matched

---

## `goToPartial.additionalPartialTagNames`

**Type:** `string[]`  
**Default:** `[]`

A list of custom HTML element names that use a `name` attribute to reference a partial view. Use this to support custom tag helpers (e.g. wrappers around `<partial>`) that use a different element name but the same `name` attribute convention.

### Example

```html
<ec-partial name="NewsArticleContent" />
<my-partial name="_Footer" />
```

Add the element names to the setting:

```jsonc
"goToPartial.additionalPartialTagNames": ["ec-partial", "my-partial"]
```

### Example — workspace `settings.json`

```jsonc
{
  "goToPartial.additionalPartialTagNames": [
    "ec-partial"
  ]
}
```

---

## Built-in patterns (not configurable)

The following patterns are always active and require no configuration:

| Pattern | Navigable value |
|---|---|
| `@Html.Partial("name")` | first string argument |
| `@Html.PartialAsync("name")` | first string argument |
| `@await Html.PartialAsync("name")` | first string argument |
| `@Html.RenderPartial("name")` | first string argument |
| `@Html.RenderPartialAsync("name")` | first string argument |
| `<partial name="value" />` | `name` attribute value |

---

## View resolution order (not configurable)

The extension resolves partial names using the standard ASP.NET MVC/Razor Pages lookup order:

1. Same folder as the current `.cshtml` file
2. `Views/Shared/`
3. `Views/Partials/`
4. `Pages/Shared/`
5. `Areas/{areaName}/Views/Shared/` _(only when the current file is inside an `Areas/` folder)_

Both with and without the `.cshtml` extension are tried. Tilde-rooted paths like `~/Views/Shared/_MyPartial.cshtml` are resolved relative to the workspace root.
