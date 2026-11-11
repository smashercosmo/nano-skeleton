import { requestHighlight } from "#root/scripts/highlight.js";

const PROPERTIES = [
  ["glyphWidth", "--nano-skeleton-inline-glyph-width"],
  ["ascent", "--nano-skeleton-inline-ascent"],
  ["descent", "--nano-skeleton-inline-descent"],
  ["borderRadius", "--nano-skeleton-inline-border-radius"],
  ["baselineShift", "--nano-skeleton-inline-baseline-shift"],
] as const;

const TEXT_BOX = "cap alphabetic";

function inputValue(form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name);
  return input instanceof HTMLInputElement ? input.value : "";
}

function isChecked(form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name);
  return input instanceof HTMLInputElement && input.checked;
}

function setOutput(form: HTMLFormElement, name: string, value: string) {
  const output = form.elements.namedItem(`${name}Out`);
  if (output instanceof HTMLOutputElement) {
    output.value = value;
  }
}

function initInlineStyles() {
  const form = document.querySelector<HTMLFormElement>(
    "[data-inline-styles-form]",
  );
  const preview = document.querySelector<HTMLElement>(
    "[data-inline-styles-preview]",
  );
  const code = document.querySelector("[data-inline-styles-css]");

  if (!form || !preview || !code) {
    return;
  }

  function update() {
    if (!form || !preview || !code) {
      return;
    }
    const fontSize = `${inputValue(form, "fontSize")}px`;
    preview.style.fontSize = fontSize;
    setOutput(form, "fontSize", fontSize);

    const declarations = [`  font-size: ${fontSize};`];

    for (const [name, property] of PROPERTIES) {
      const value = String(Number(inputValue(form, name)));
      preview.style.setProperty(property, value);
      setOutput(form, name, value);
      declarations.push(`  ${property}: ${value};`);
    }

    const trimmed = isChecked(form, "textBox");
    for (const skeleton of preview.querySelectorAll<HTMLElement>(
      'nano-skeleton[inline="lines-bg-per-line"]',
    )) {
      const block = skeleton.parentElement;
      if (trimmed) {
        block?.style.setProperty("text-box", TEXT_BOX);
      } else {
        block?.style.removeProperty("text-box");
      }
    }

    const rules = [`.card {\n${declarations.join("\n")}\n}`];
    if (trimmed) {
      rules.push(`h3,\np {\n  text-box: ${TEXT_BOX};\n}`);
    }
    code.textContent = rules.join("\n\n");
    requestHighlight();
  }

  form.addEventListener("input", update);
  form.addEventListener("reset", () => {
    update();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  update();
}

export { initInlineStyles };
