export interface ValidationItem {
  id: string;
  type: "success" | "warning" | "error" | "info";
  category: "JSON Syntax" | "Capabilities Schema" | "Visual Entry Point" | "Settings Mapping" | "Packaging Config";
  title: string;
  description: string;
  details?: string;
}

export interface ValidationReport {
  isValid: boolean;
  score: number; // 0 to 100
  items: ValidationItem[];
}

export function validatePBIProject(files: {
  "pbiviz.json": string;
  "capabilities.json": string;
  "src/visual.ts": string;
  "style/visual.less": string;
  "package.json": string;
  "tsconfig.json": string;
}): ValidationReport {
  const items: ValidationItem[] = [];
  let errorCount = 0;
  let warningCount = 0;

  // Helper to add results
  const addResult = (item: ValidationItem) => {
    items.push(item);
    if (item.type === "error") errorCount++;
    if (item.type === "warning") warningCount++;
  };

  // 1. Validate JSON Syntax for capabilities.json
  let capabilitiesObj: any = null;
  try {
    const jsonText = files["capabilities.json"] || "";
    if (!jsonText.trim()) {
      addResult({
        id: "cap-empty",
        type: "error",
        category: "JSON Syntax",
        title: "capabilities.json is empty",
        description: "The capabilities.json file is required and cannot be empty.",
      });
    } else {
      capabilitiesObj = JSON.parse(jsonText);
      addResult({
        id: "cap-json-valid",
        type: "success",
        category: "JSON Syntax",
        title: "capabilities.json syntax is valid",
        description: "Successfully parsed capabilities.json. Syntax is clean.",
      });
    }
  } catch (err: any) {
    addResult({
      id: "cap-json-invalid",
      type: "error",
      category: "JSON Syntax",
      title: "capabilities.json syntax error",
      description: `Failed to parse capabilities.json: ${err.message}`,
      details: "Power BI will fail to compile or load this custom visual if capabilities.json has any syntax errors or trailing commas in older standards.",
    });
  }

  // 2. Validate JSON Syntax for pbiviz.json
  let pbivizObj: any = null;
  try {
    const jsonText = files["pbiviz.json"] || "";
    if (!jsonText.trim()) {
      addResult({
        id: "pbiviz-empty",
        type: "error",
        category: "JSON Syntax",
        title: "pbiviz.json is empty",
        description: "The pbiviz.json file is required for custom visual packaging.",
      });
    } else {
      pbivizObj = JSON.parse(jsonText);
      addResult({
        id: "pbiviz-json-valid",
        type: "success",
        category: "JSON Syntax",
        title: "pbiviz.json syntax is valid",
        description: "Successfully parsed pbiviz.json packaging manifest.",
      });
    }
  } catch (err: any) {
    addResult({
      id: "pbiviz-json-invalid",
      type: "error",
      category: "JSON Syntax",
      title: "pbiviz.json syntax error",
      description: `Failed to parse pbiviz.json: ${err.message}`,
    });
  }

  // 3. Validate JSON Syntax for package.json
  let packageObj: any = null;
  try {
    const jsonText = files["package.json"] || "";
    if (jsonText.trim()) {
      packageObj = JSON.parse(jsonText);
      addResult({
        id: "pkg-json-valid",
        type: "success",
        category: "JSON Syntax",
        title: "package.json syntax is valid",
        description: "Successfully parsed package.json node configuration.",
      });
    }
  } catch (err: any) {
    addResult({
      id: "pkg-json-invalid",
      type: "error",
      category: "JSON Syntax",
      title: "package.json syntax error",
      description: `Failed to parse package.json: ${err.message}`,
    });
  }

  const visualTS = files["src/visual.ts"] || "";

  // 4. Validate Visual Class Matches pbiviz.json
  if (pbivizObj && visualTS) {
    const visualClassName = pbivizObj.visual?.visualClassName;
    if (!visualClassName) {
      addResult({
        id: "pbiviz-classname-missing",
        type: "error",
        category: "Packaging Config",
        title: "visualClassName is missing in pbiviz.json",
        description: "The pbiviz.json visual descriptor must declare a visualClassName (e.g., 'Visual').",
      });
    } else {
      // Look for the class declaration in visual.ts
      const classRegex = new RegExp(`class\\s+${visualClassName}\\b`);
      const hasClass = classRegex.test(visualTS);

      if (hasClass) {
        addResult({
          id: "class-match-success",
          type: "success",
          category: "Visual Entry Point",
          title: `Class '${visualClassName}' matches entry point`,
          description: `The class '${visualClassName}' defined in pbiviz.json is declared correctly inside src/visual.ts.`,
        });
      } else {
        addResult({
          id: "class-match-error",
          type: "error",
          category: "Visual Entry Point",
          title: `Entry point class mismatch`,
          description: `The pbiviz.json specifies visualClassName as '${visualClassName}', but no matching 'class ${visualClassName}' declaration was found in src/visual.ts.`,
          details: `To resolve this, make sure the visual class definition inside src/visual.ts matches the pbiviz.json: export class ${visualClassName} implements IVisual { ... }`
        });
      }
    }
  }

  // 5. Schema & Settings Mapping Analysis (Capabilities.json vs Visual.ts)
  if (capabilitiesObj) {
    const capabilitiesObjects = capabilitiesObj.objects || {};
    const objectsKeys = Object.keys(capabilitiesObjects);

    if (objectsKeys.length === 0) {
      addResult({
        id: "cap-no-objects",
        type: "info",
        category: "Capabilities Schema",
        title: "No format settings declared",
        description: "There are no customizable formatting objects declared under 'objects' in capabilities.json.",
      });
    } else {
      // Parse the visual.ts to find referenced variables and lines
      // Let's check for reference to each object and its properties
      objectsKeys.forEach((objKey) => {
        const objVal = capabilitiesObjects[objKey];
        const properties = objVal.properties || {};
        const propKeys = Object.keys(properties);

        // Check if object is referenced in visual.ts
        // In visual.ts we look for things like objects["gridTheme"] or currentSettings.gridTheme
        const isObjReferenced = visualTS.includes(objKey);

        if (!isObjReferenced) {
          addResult({
            id: `cap-obj-unreferenced-${objKey}`,
            type: "warning",
            category: "Settings Mapping",
            title: `Object '${objKey}' never used in visual.ts`,
            description: `Formatting group '${objKey}' is defined in capabilities.json but doesn't seem to be parsed or utilized anywhere in src/visual.ts.`,
            details: `In Power BI, properties under this object will show up in the properties panel but modifying them will have zero effect on the canvas because visual.ts never retrieves them from the DataView.`,
          });
        } else {
          // Object is used. Let's check its individual properties!
          propKeys.forEach((propKey) => {
            const propVal = properties[propKey];
            const isPropReferenced = visualTS.includes(propKey);

            if (!isPropReferenced) {
              addResult({
                id: `cap-prop-unreferenced-${objKey}-${propKey}`,
                type: "warning",
                category: "Settings Mapping",
                title: `Property '${objKey}.${propKey}' never used`,
                description: `Property '${propKey}' is defined inside capabilities.json under '${objKey}', but does not appear in src/visual.ts.`,
                details: `Power BI Desktop will draw a controller (e.g. color picker, input field, or toggle switch) for this, but the user's input will be ignored. Ensure you bind this property inside visual.ts.`,
              });
            } else {
              // Property is referenced! Let's check if it's enumerated in enumerateObjectInstances
              // Look at the enumerateObjectInstances block inside visual.ts
              const enumInstancesIndex = visualTS.indexOf("enumerateObjectInstances");
              if (enumInstancesIndex !== -1) {
                // Get approximate enumerateObjectInstances block (up to 500 lines or search carefully)
                const enumBlock = visualTS.substring(enumInstancesIndex, enumInstancesIndex + 15000);
                
                // Let's check if there's a case block for this object
                const caseRegex = new RegExp(`case\\s+['"\`]${objKey}['"\`]`);
                const hasCase = caseRegex.test(enumBlock);

                if (!hasCase) {
                  addResult({
                    id: `cap-obj-not-enumerated-${objKey}`,
                    type: "warning",
                    category: "Settings Mapping",
                    title: `Object '${objKey}' missing from enumerateObjectInstances`,
                    description: `The formatting object '${objKey}' is used in visual.ts but is not enumerated in 'enumerateObjectInstances'.`,
                    details: `Without returning instances for '${objKey}', Power BI will hide or disable this formatting card in the formatting pane of Desktop. To fix, add a case '${objKey}' statement returning the property instances.`,
                  });
                } else {
                  // The case exists! Check if the specific property is enumerated in the properties object
                  // Find the segment between case 'objKey' and the next case or return
                  const caseStart = enumBlock.search(caseRegex);
                  const subEnumBlock = enumBlock.substring(caseStart, caseStart + 2000);
                  
                  // Look for propKey inside this sub-block
                  const hasPropInEnum = subEnumBlock.includes(propKey);

                  if (!hasPropInEnum) {
                    addResult({
                      id: `cap-prop-not-enumerated-${objKey}-${propKey}`,
                      type: "warning",
                      category: "Settings Mapping",
                      title: `Property '${objKey}.${propKey}' not enumerated`,
                      description: `The property '${propKey}' is defined in capabilities.json but is not returned by 'enumerateObjectInstances' for object '${objKey}'.`,
                      details: `Users will not see this property in the Power BI Desktop Formatting Pane, preventing them from modifying its value. Ensure it's listed under properties inside enumerateObjectInstances for '${objKey}'.`,
                    });
                  } else {
                    // Success! Property is properly declared, parsed, and enumerated
                    // Let's do type matching check
                    const pbiType = propVal.type || {};
                    let expectedPBIType = "";
                    if (pbiType.fill) expectedPBIType = "fill / color";
                    else if (pbiType.bool) expectedPBIType = "boolean / toggle";
                    else if (pbiType.text) expectedPBIType = "text / string";
                    else if (pbiType.numeric || pbiType.integer) expectedPBIType = "numeric / number";
                    else expectedPBIType = "generic";

                    // Let's analyze how it is output in enumerateObjectInstances
                    // For color/fill, in PBI enumerateObjectInstances it MUST use format: { solid: { color: value } }
                    // E.g. headerBgColor: { solid: { color: ... } }
                    if (pbiType.fill) {
                      const fillPattern = new RegExp(`${propKey}\\s*:\\s*\\{\\s*solid\\s*:\\s*\\{\\s*color\\b`);
                      const hasFillPattern = fillPattern.test(subEnumBlock);
                      if (!hasFillPattern) {
                        addResult({
                          id: `cap-prop-type-mismatch-${objKey}-${propKey}`,
                          type: "warning",
                          category: "Settings Mapping",
                          title: `Color property '${objKey}.${propKey}' format risk`,
                          description: `Property '${propKey}' is a 'fill' (color) type in capabilities.json, but does not seem to return the Power BI standard '{ solid: { color: ... } }' structure in enumerateObjectInstances.`,
                          details: `In Power BI, fill settings MUST be returned as { solid: { color: this.currentSettings.${objKey}.${propKey} } } or similar object. If you just return the string color value, the Power BI Formatting Pane will crash or display an empty box.`,
                        });
                      } else {
                        addResult({
                          id: `cap-prop-type-match-${objKey}-${propKey}`,
                          type: "success",
                          category: "Settings Mapping",
                          title: `Property '${objKey}.${propKey}' is perfectly mapped`,
                          description: `Declared as color/fill, and correctly returned as '{ solid: { color: value } }' in enumerateObjectInstances.`,
                        });
                      }
                    } else {
                      // Normal type
                      addResult({
                        id: `cap-prop-mapped-${objKey}-${propKey}`,
                        type: "success",
                        category: "Settings Mapping",
                        title: `Property '${objKey}.${propKey}' is fully mapped`,
                        description: `Type '${expectedPBIType}' is correctly declared, referenced, and returned in the formatting enumerate instances.`,
                      });
                    }
                  }
                }
              }
            }
          });
        }
      });
    }
  }

  // 6. Inspect enumerateObjectInstances for properties that are NOT declared in capabilities.json
  if (capabilitiesObj && visualTS) {
    const capabilitiesObjects = capabilitiesObj.objects || {};
    
    // Look at the properties in enumerateObjectInstances
    const enumInstancesIndex = visualTS.indexOf("enumerateObjectInstances");
    if (enumInstancesIndex !== -1) {
      const enumBlock = visualTS.substring(enumInstancesIndex, enumInstancesIndex + 15000);
      
      // Look for properties: { ... } patterns in the code
      // We can scan case statements and extract properties
      const caseBlockRegex = /case\s+['"`]([a-zA-Z0-9_]+)['"`]\s*:\s*([\s\S]*?)(?:case\s+|switch\s+|\bcase\b|return\b)/g;
      let match;
      
      while ((match = caseBlockRegex.exec(enumBlock)) !== null) {
        const objKey = match[1];
        const caseContent = match[2];
        
        // Is this object key defined in capabilities?
        if (!capabilitiesObjects[objKey]) {
          addResult({
            id: `enum-obj-not-in-cap-${objKey}`,
            type: "error",
            category: "Capabilities Schema",
            title: `Object '${objKey}' returned but not declared`,
            description: `Object '${objKey}' is enumerated inside 'enumerateObjectInstances', but is not defined under 'objects' in capabilities.json.`,
            details: `This will cause Power BI Desktop to throw a fatal error on rendering the format panel. Please declare '${objKey}' under 'objects' in capabilities.json.`,
          });
        } else {
          // Object exists, now let's parse enumerated properties and make sure they exist in capabilities
          // Look for: propertyKey: value pattern
          const propListRegex = /([a-zA-Z0-9_]+)\s*:\s*[^,\n]+/g;
          let propMatch;
          const declaredProps = capabilitiesObjects[objKey].properties || {};
          
          while ((propMatch = propListRegex.exec(caseContent)) !== null) {
            const propKey = propMatch[1];
            // Exclude common keywords or special JS variables
            if (["objectName", "selector", "solid", "color", "properties", "displayName", "description"].includes(propKey)) {
              continue;
            }
            
            if (!declaredProps[propKey]) {
              addResult({
                id: `enum-prop-not-in-cap-${objKey}-${propKey}`,
                type: "error",
                category: "Capabilities Schema",
                title: `Property '${objKey}.${propKey}' not declared`,
                description: `Property '${propKey}' is enumerated under '${objKey}', but is not defined in capabilities.json.`,
                details: `Power BI Desktop requires every property returned by enumerateObjectInstances to be declared under capabilities.json objects. Returning undeclared properties is a primary cause of silent visual loading failures or visual crashes in Power BI Desktop.`,
              });
            }
          }
        }
      }
    }
  }

  // 7. Check apiVersion in pbiviz.json vs package.json dependencies
  if (pbivizObj && packageObj) {
    const apiVersion = pbivizObj.apiVersion;
    const deps = packageObj.dependencies || {};
    const devDeps = packageObj.devDependencies || {};
    const pbiApiDep = deps["powerbi-visuals-api"] || devDeps["powerbi-visuals-api"];

    if (apiVersion && pbiApiDep) {
      // e.g. apiVersion is "5.3.0", pbiApiDep is "^5.3.0"
      const cleanDep = pbiApiDep.replace(/[^0-9.]/g, "");
      if (apiVersion !== cleanDep && !pbiApiDep.includes(apiVersion)) {
        addResult({
          id: "api-version-mismatch",
          type: "warning",
          category: "Packaging Config",
          title: "API version mismatch",
          description: `pbiviz.json declares apiVersion as '${apiVersion}', but package.json has 'powerbi-visuals-api' as '${pbiApiDep}'.`,
          details: "Although it may compile in some environments, keeping the apiVersion in pbiviz.json perfectly synced with the actual powerbi-visuals-api dependency version in package.json is highly recommended to avoid run-time typing or polyfill bugs in older versions of Power BI Service / Desktop.",
        });
      } else {
        addResult({
          id: "api-version-match",
          type: "success",
          category: "Packaging Config",
          title: "API versions are synchronized",
          description: `API version '${apiVersion}' in pbiviz.json is compatible with 'powerbi-visuals-api' version '${pbiApiDep}' in package.json.`,
        });
      }
    }
  }

  // Calculate final score
  // Start at 100, deduct 20 for each error, 5 for each warning
  const totalDeductions = (errorCount * 20) + (warningCount * 5);
  const score = Math.max(0, 100 - totalDeductions);
  const isValid = errorCount === 0;

  return {
    isValid,
    score,
    items,
  };
}
