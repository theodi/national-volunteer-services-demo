/**
 * Re-export for bundler resolution. @ldo/connected-solid imports ".ldo/solid.shapeTypes.js"
 * relative to its dist, which some bundlers resolve from project root. This file is aliased
 * so the import resolves here, and we re-export from the package.
 */
export { ProfileWithStorageShapeType } from "../node_modules/@ldo/connected-solid/dist/.ldo/solid.shapeTypes.js";
