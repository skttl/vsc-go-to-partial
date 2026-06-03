# Go To Partial

A VS Code extension that adds **Go to Definition** (F12 / Ctrl+Click) support for Razor partial view references in `.cshtml` files. Quickly navigate from any `@Html.Partial`, `@Html.PartialAsync`, `<partial>`, or related call directly to the target view file.

---

## Features

- **Go to Definition** — press F12 or Ctrl+Click on a partial view name to jump to the file
- **Live diagnostics** — unresolved partial references are highlighted with a warning squiggle as you type
- **ASP.NET-aware resolution** — follows the standard ASP.NET MVC/Razor Pages view lookup order, including Areas
- **Tilde path support** — resolves both short names (`"_MyPartial"`) and root-relative paths (`"~/Views/Shared/_MyPartial.cshtml"`)
- **Custom tag helper support** — configure additional HTML attribute names from your own tag helpers

---

## Installation

### From the VS Code Marketplace

> _Coming soon — marketplace publishing is planned for a future release._

### From a `.vsix` file

1. Download the latest `.vsix` from the [GitHub Releases](../../releases) page
2. In VS Code, open the Command Palette (`Ctrl+Shift+P`) → **Extensions: Install from VSIX...**
3. Select the downloaded file

---

## Supported syntax

| Pattern | Navigable part |
|---|---|
| `@Html.Partial("_Name")` | `"_Name"` |
| `@Html.PartialAsync("_Name")` | `"_Name"` |
| `@await Html.PartialAsync("_Name")` | `"_Name"` |
| `@Html.RenderPartial("_Name")` | `"_Name"` |
| `@Html.RenderPartialAsync("_Name")` | `"_Name"` |
| `<partial name="_Name" />` | `"_Name"` |
| Custom tag helpers | configurable via [`goToPartial.additionalTagHelperAttributes`](docs/configuration.md) |

Both short names (`"_MyPartial"`) and tilde-rooted paths (`"~/Views/Shared/_MyPartial.cshtml"`) are supported.

---

## View resolution order

When a short name like `"_MyPartial"` is used, the extension searches in this order:

1. Same folder as the current file
2. `Views/Shared/`
3. `Views/Partials/`
4. `Pages/Shared/`
5. `Areas/{areaName}/Views/Shared/` _(if the current file is inside an Area)_

The extension tries both with and without the `.cshtml` extension.

---

## Settings

See [docs/configuration.md](docs/configuration.md) for the full settings reference.

| Setting | Type | Default | Description |
|---|---|---|---|
| `goToPartial.additionalTagHelperAttributes` | `string[]` | `[]` | Extra HTML attribute names whose values should be treated as partial view names |
| `goToPartial.additionalPartialTagNames` | `string[]` | `[]` | Custom element names (e.g. `ec-partial`) that use a `name` attribute to reference a partial view |

---

## Contributing

See [docs/contributing.md](docs/contributing.md) for development setup, commit conventions, and the release process.

---

## License

MIT
