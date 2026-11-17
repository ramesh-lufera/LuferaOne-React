# Module layout conventions

Use `src/components/ModulePageHeader.jsx` for new module page headers. It places Back on the left, the page title in the center, and the Dashboard breadcrumb on the right.

Use `ModuleTable`, `ModuleTableToolbar`, and `ModuleTablePagination` from `src/components/ModuleTable.jsx` for new module tables. Define explicit column widths, use the Show selector and search toolbar, and include the entry range with the numbered pagination controls.

Center Status and Action headers and their cells. Use `module-table-action` to center action icons inside their buttons.

Use `src/components/ModuleTableCell.jsx` for long text. It truncates overflowing text with an ellipsis and shows the full content in a headerless popover on hover or keyboard focus only when the cell overflows.

The Roles & Permissions and Assign Role pages demonstrate these shared components.
