import { registerHooks } from "node:module";

function resolve(specifier, context, nextResolve) {
  try {
    return nextResolve(specifier, context);
  } catch (error) {
    const isExtensionlessRelativeImport =
      error?.code === "ERR_MODULE_NOT_FOUND" &&
      specifier.startsWith(".") &&
      !specifier.match(/\.[cm]?[jt]sx?$/);

    if (!isExtensionlessRelativeImport) {
      throw error;
    }

    return nextResolve(`${specifier}.ts`, context);
  }
}

registerHooks({ resolve });
