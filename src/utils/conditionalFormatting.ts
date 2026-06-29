import { DAXMeasure } from "../types";

export interface CellStyle {
  background?: string;
  foreground?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  icon?: string;
  svgIcon?: string;
  borderColor?: string;
  borderThickness?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  opacity?: number;
  padding?: string;
  rowHeight?: string;
  tooltip?: string;
  cursor?: string;
  animation?: string;
}

export type CFEngineType = "rule" | "text" | "expression" | "measure";

export interface CFRule {
  id: string;
  name: string;
  isEnabled: boolean;
  engine: CFEngineType;
  priority: number; // Smaller number = higher priority (e.g. 1 overrides 2)
  
  // Targets
  targetType: "cell" | "row" | "column" | "node" | "subtotal" | "grandtotal";
  targetColumn?: "actual" | "budget" | "variance" | "variancePct" | "all"; 
  targetRowHeader?: string; // "all" or specific row category name

  // Rule Engine Options (Numeric / Boolean)
  ruleField?: "actual" | "budget" | "variance" | "variancePct";
  ruleOperator?: "greater" | "less" | "greaterEqual" | "lessEqual" | "equal" | "notEqual" | "between" | "notBetween" | "inList";
  ruleValue1?: string;
  ruleValue2?: string;

  // Text Engine Options
  textField?: "name" | "description"; // cleanName
  textOperator?: "startsWith" | "endsWith" | "contains" | "equals" | "notEquals" | "regex" | "isEmpty" | "isNotEmpty";
  textValue?: string;

  // Expression Engine Options
  expressionString?: string; // LEFT(AccountCode,1)="9"

  // DAX Measure-Based Options
  measureId?: string; // Custom DAX measure ID
  measureTargetProperty?: "background" | "foreground" | "icon" | "borderColor" | "fontWeight" | "opacity" | "tooltip" | "allStyles";

  // Result Style
  style: CellStyle;
}

// ==========================================
// 1. EXPRESSION ENGINE: TOKENIZER & PARSER
// ==========================================

export type TokenType =
  | "LPAREN"
  | "RPAREN"
  | "COMMA"
  | "OPERATOR"
  | "LOGICAL"
  | "STRING"
  | "NUMBER"
  | "FUNCTION"
  | "IDENTIFIER"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const whitespace = /^\s+/;
  const numberRegex = /^-?\d+(\.\d+)?/;
  const stringRegex = /^"([^"\\]|\\.)*"|^'([^'\\]|\\.)*'/;
  const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*/;
  const operatorRegex = /^<=|^>=|^<>|^<|^>|^=/;

  const functionNames = new Set([
    "LEFT",
    "RIGHT",
    "MID",
    "LEN",
    "UPPER",
    "LOWER",
    "TRIM",
    "ABS",
    "ROUND",
    "ISBLANK",
    "CONTAINS",
    "STARTSWITH",
    "ENDSWITH",
  ]);

  const logicalOperators = new Set(["AND", "OR", "NOT"]);

  while (i < input.length) {
    const substr = input.substring(i);

    // Whitespace
    const wsMatch = whitespace.exec(substr);
    if (wsMatch) {
      i += wsMatch[0].length;
      continue;
    }

    // LPAREN
    if (substr.startsWith("(")) {
      tokens.push({ type: "LPAREN", value: "(" });
      i += 1;
      continue;
    }

    // RPAREN
    if (substr.startsWith(")")) {
      tokens.push({ type: "RPAREN", value: ")" });
      i += 1;
      continue;
    }

    // COMMA
    if (substr.startsWith(",")) {
      tokens.push({ type: "COMMA", value: "," });
      i += 1;
      continue;
    }

    // Operators
    const opMatch = operatorRegex.exec(substr);
    if (opMatch) {
      tokens.push({ type: "OPERATOR", value: opMatch[0] });
      i += opMatch[0].length;
      continue;
    }

    // Quoted Strings
    const strMatch = stringRegex.exec(substr);
    if (strMatch) {
      const val = strMatch[0].substring(1, strMatch[0].length - 1); // remove quotes
      tokens.push({ type: "STRING", value: val });
      i += strMatch[0].length;
      continue;
    }

    // Numbers
    const numMatch = numberRegex.exec(substr);
    if (numMatch) {
      tokens.push({ type: "NUMBER", value: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }

    // Identifiers / Functions / Logical Keywords
    const idMatch = identifierRegex.exec(substr);
    if (idMatch) {
      const val = idMatch[0];
      const upperVal = val.toUpperCase();

      if (logicalOperators.has(upperVal)) {
        tokens.push({ type: "LOGICAL", value: upperVal });
      } else if (functionNames.has(upperVal)) {
        tokens.push({ type: "FUNCTION", value: upperVal });
      } else {
        tokens.push({ type: "IDENTIFIER", value: val });
      }
      i += val.length;
      continue;
    }

    // Fallback: Skip character to avoid infinite loops if encountering invalid characters
    i += 1;
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

export interface ASTNode {
  type: string;
  [key: string]: any;
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private match(type: TokenType, value?: string): boolean {
    const tok = this.peek();
    if (tok.type !== type) return false;
    if (value !== undefined && tok.value !== value) return false;
    this.current++;
    return true;
  }

  private consume(type: TokenType, message: string): Token {
    const tok = this.peek();
    if (tok.type === type) {
      this.current++;
      return tok;
    }
    throw new Error(`${message} (Found token: ${tok.type} "${tok.value}")`);
  }

  public parse(): ASTNode {
    try {
      const node = this.parseOr();
      if (this.peek().type !== "EOF") {
        throw new Error("Unexpected token after end of expression.");
      }
      return node;
    } catch (e: any) {
      return { type: "Error", message: e.message };
    }
  }

  private parseOr(): ASTNode {
    let node = this.parseAnd();
    while (this.match("LOGICAL", "OR")) {
      const right = this.parseAnd();
      node = { type: "LogicalExpression", operator: "OR", left: node, right };
    }
    return node;
  }

  private parseAnd(): ASTNode {
    let node = this.parseNot();
    while (this.match("LOGICAL", "AND")) {
      const right = this.parseNot();
      node = { type: "LogicalExpression", operator: "AND", left: node, right };
    }
    return node;
  }

  private parseNot(): ASTNode {
    if (this.match("LOGICAL", "NOT")) {
      const argument = this.parseComparison();
      return { type: "UnaryExpression", operator: "NOT", argument };
    }
    return this.parseComparison();
  }

  private parseComparison(): ASTNode {
    let node = this.parseTerm();
    const tok = this.peek();
    if (tok.type === "OPERATOR") {
      this.current++; // consume operator
      const right = this.parseTerm();
      node = { type: "ComparisonExpression", operator: tok.value, left: node, right };
    }
    return node;
  }

  private parseTerm(): ASTNode {
    let node = this.parseFactor();
    while (this.peek().type === "OPERATOR" && (this.peek().value === "+" || this.peek().value === "-")) {
      const op = this.peek().value;
      this.current++;
      const right = this.parseFactor();
      node = { type: "BinaryExpression", operator: op, left: node, right };
    }
    return node;
  }

  private parseFactor(): ASTNode {
    let node = this.parsePrimary();
    while (this.peek().type === "OPERATOR" && (this.peek().value === "*" || this.peek().value === "/")) {
      const op = this.peek().value;
      this.current++;
      const right = this.parsePrimary();
      node = { type: "BinaryExpression", operator: op, left: node, right };
    }
    return node;
  }

  private parsePrimary(): ASTNode {
    const tok = this.peek();

    if (this.match("NUMBER")) {
      return { type: "NumericLiteral", value: Number(tok.value) };
    }

    if (this.match("STRING")) {
      return { type: "StringLiteral", value: tok.value };
    }

    if (this.match("IDENTIFIER")) {
      return { type: "Identifier", value: tok.value };
    }

    if (this.match("FUNCTION")) {
      const funcName = tok.value;
      this.consume("LPAREN", `Expected '(' after function ${funcName}`);
      const args: ASTNode[] = [];
      if (this.peek().type !== "RPAREN") {
        args.push(this.parseOr());
        while (this.match("COMMA")) {
          args.push(this.parseOr());
        }
      }
      this.consume("RPAREN", `Expected ')' after function arguments of ${funcName}`);
      return { type: "FunctionCall", name: funcName, arguments: args };
    }

    if (this.match("LPAREN")) {
      const node = this.parseOr();
      this.consume("RPAREN", "Expected ')' to close parenthesis");
      return node;
    }

    throw new Error(`Unexpected token inside primary expression: ${tok.type} "${tok.value}"`);
  }
}

// ==========================================
// 2. EXPRESSION EVALUATOR
// ==========================================

export function evaluateAST(node: ASTNode, context: Record<string, any>): any {
  if (!node) return null;

  switch (node.type) {
    case "NumericLiteral":
    case "StringLiteral":
      return node.value;

    case "Identifier": {
      const val = context[node.value];
      return val !== undefined ? val : null;
    }

    case "LogicalExpression": {
      const leftVal = evaluateAST(node.left, context);
      const rightVal = evaluateAST(node.right, context);
      if (node.operator === "AND") {
        return !!leftVal && !!rightVal;
      } else if (node.operator === "OR") {
        return !!leftVal || !!rightVal;
      }
      return false;
    }

    case "UnaryExpression": {
      const argVal = evaluateAST(node.argument, context);
      if (node.operator === "NOT") {
        return !argVal;
      }
      return false;
    }

    case "ComparisonExpression": {
      const left = evaluateAST(node.left, context);
      const right = evaluateAST(node.right, context);

      const lStr = String(left).toLowerCase().trim();
      const rStr = String(right).toLowerCase().trim();
      const lNum = Number(left);
      const rNum = Number(right);

      const isNumeric = !isNaN(lNum) && !isNaN(rNum) && typeof left !== "string" && typeof right !== "string";

      switch (node.operator) {
        case "=":
          return isNumeric ? lNum === rNum : lStr === rStr;
        case "<>":
          return isNumeric ? lNum !== rNum : lStr !== rStr;
        case "<":
          return isNumeric ? lNum < rNum : lStr < rStr;
        case ">":
          return isNumeric ? lNum > rNum : lStr > rStr;
        case "<=":
          return isNumeric ? lNum <= rNum : lStr <= rStr;
        case ">=":
          return isNumeric ? lNum >= rNum : lStr >= rStr;
        default:
          return false;
      }
    }

    case "BinaryExpression": {
      const left = Number(evaluateAST(node.left, context)) || 0;
      const right = Number(evaluateAST(node.right, context)) || 0;
      switch (node.operator) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return right !== 0 ? left / right : 0;
        default: return 0;
      }
    }

    case "FunctionCall": {
      const resolvedArgs = node.arguments.map((arg: ASTNode) => evaluateAST(arg, context));
      const fnName = node.name.toUpperCase();

      const strArg = (idx: number) => String(resolvedArgs[idx] ?? "");
      const numArg = (idx: number) => Number(resolvedArgs[idx] ?? 0);

      switch (fnName) {
        case "LEFT": {
          const s = strArg(0);
          const len = numArg(1);
          return s.substring(0, len);
        }
        case "RIGHT": {
          const s = strArg(0);
          const len = numArg(1);
          return s.substring(Math.max(0, s.length - len));
        }
        case "MID": {
          const s = strArg(0);
          const start = numArg(1);
          const len = numArg(2);
          // Power BI/Excel is 1-indexed, handle gracefully
          const actualStart = Math.max(0, start - 1);
          return s.substring(actualStart, actualStart + len);
        }
        case "LEN": {
          return strArg(0).length;
        }
        case "UPPER": {
          return strArg(0).toUpperCase();
        }
        case "LOWER": {
          return strArg(0).toLowerCase();
        }
        case "TRIM": {
          return strArg(0).trim();
        }
        case "ABS": {
          return Math.abs(numArg(0));
        }
        case "ROUND": {
          const num = numArg(0);
          const decimals = resolvedArgs[1] !== undefined ? numArg(1) : 0;
          const factor = Math.pow(10, decimals);
          return Math.round(num * factor) / factor;
        }
        case "ISBLANK": {
          const val = resolvedArgs[0];
          return val === null || val === undefined || String(val).trim() === "";
        }
        case "CONTAINS": {
          const s = strArg(0).toLowerCase();
          const sub = strArg(1).toLowerCase();
          return s.includes(sub);
        }
        case "STARTSWITH": {
          const s = strArg(0).toLowerCase();
          const prefix = strArg(1).toLowerCase();
          return s.startsWith(prefix);
        }
        case "ENDSWITH": {
          const s = strArg(0).toLowerCase();
          const suffix = strArg(1).toLowerCase();
          return s.endsWith(suffix);
        }
        default:
          return null;
      }
    }

    default:
      return null;
  }
}

// ==========================================
// 3. DAX EVALUATOR ENGINE (MOCK RESOLUTION)
// ==========================================

export function evaluateDAXLocal(formula: string, actual: number, budget: number, rowContext?: any): any {
  const cleaned = (formula || "").trim();
  if (!cleaned) return 0;

  // Pre-normalize common typos in LEFT/RIGHT/MID: Left[Account Code] -> LEFT([Account Code])
  let expr = cleaned
    .replace(/LEFT\s*\[([^\]]+)\]\s*,\s*([0-9]+)/gi, "LEFT([$1], $2)")
    .replace(/RIGHT\s*\[([^\]]+)\]\s*,\s*([0-9]+)/gi, "RIGHT([$1], $2)");

  let categoryName = "";
  if (rowContext) {
    categoryName = (rowContext.category || rowContext.cleanName || rowContext.name || "").trim();
  }
  
  let accountCode = categoryName;
  const leadingCodeMatch = categoryName.match(/^([0-9\.\-\/]+)/);
  if (leadingCodeMatch) {
    accountCode = leadingCodeMatch[1].trim();
  }

  const variance = actual - budget;
  const variancePct = budget !== 0 ? (variance / budget) * 100 : 0;

  // Perform substitutions of column bracket references
  expr = expr
    .replace(/\[Actual\]/gi, String(actual))
    .replace(/\[Sales\]/gi, String(actual))
    .replace(/\[Budget\]/gi, String(budget))
    .replace(/\[Variance\]/gi, String(variance))
    .replace(/\[Profit\]/gi, String(variance))
    .replace(/\[VariancePct\]/gi, String(variancePct))
    .replace(/\[Variance\s*%\]/gi, String(variancePct))
    .replace(/\[Account\s*Code\]/gi, JSON.stringify(accountCode))
    .replace(/\[AccountCode\]/gi, JSON.stringify(accountCode))
    .replace(/\[Code\]/gi, JSON.stringify(accountCode))
    .replace(/\[Account\]/gi, JSON.stringify(categoryName))
    .replace(/\[Category\]/gi, JSON.stringify(categoryName))
    .replace(/\[Name\]/gi, JSON.stringify(categoryName))
    .replace(/\[Description\]/gi, JSON.stringify(categoryName))
    .replace(/\[Account\s*Name\]/gi, JSON.stringify(categoryName))
    .replace(/\[AccountName\]/gi, JSON.stringify(categoryName));

  // Direct hex colors
  if (/^["']?#[0-9A-Fa-f]{3,8}["']?$/.test(expr)) {
    return expr.replace(/["']/g, "");
  }
  if (/^["']?(red|green|blue|black|white|purple|yellow|orange|grey|gray)["']?$/i.test(expr)) {
    return expr.replace(/["']/g, "");
  }

  const evalMath = (mathExpr: string): any => {
    let trimmed = mathExpr.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
      return trimmed;
    }
    
    let subExpr = trimmed;
    subExpr = subExpr.replace(/DIVIDE\s*\(([^,]+),([^)]+)\)/gi, "($1)/($2)");
    subExpr = subExpr.replace(/AVERAGE\s*\(([^,]+),([^)]+)\)/gi, "(($1)+($2))/2");
    subExpr = subExpr.replace(/SUM\s*\(([^,]+),([^)]+)\)/gi, "(($1)+($2))");

    // String manipulation function regex replacements inside evalMath:
    // 1. LEFT(str, len)
    subExpr = subExpr.replace(/LEFT\s*\(([^,]+),([^)]+)\)/gi, (match, s, len) => {
      const evaluatedStr = evalMath(s);
      const evaluatedLen = Number(evalMath(len)) || 0;
      return JSON.stringify(String(evaluatedStr).substring(0, evaluatedLen));
    });

    // 2. RIGHT(str, len)
    subExpr = subExpr.replace(/RIGHT\s*\(([^,]+),([^)]+)\)/gi, (match, s, len) => {
      const evaluatedStr = evalMath(s);
      const evaluatedLen = Number(evalMath(len)) || 0;
      const str = String(evaluatedStr);
      return JSON.stringify(str.substring(Math.max(0, str.length - evaluatedLen)));
    });

    // 3. MID(str, start, len)
    subExpr = subExpr.replace(/MID\s*\(([^,]+),([^,]+),([^)]+)\)/gi, (match, s, start, len) => {
      const evaluatedStr = evalMath(s);
      const evaluatedStart = Number(evalMath(start)) || 1;
      const evaluatedLen = Number(evalMath(len)) || 0;
      const str = String(evaluatedStr);
      const actualStart = Math.max(0, evaluatedStart - 1);
      return JSON.stringify(str.substring(actualStart, actualStart + evaluatedLen));
    });

    // 4. UPPER(str)
    subExpr = subExpr.replace(/UPPER\s*\(([^)]+)\)/gi, (match, s) => {
      return JSON.stringify(String(evalMath(s)).toUpperCase());
    });

    // 5. LOWER(str)
    subExpr = subExpr.replace(/LOWER\s*\(([^)]+)\)/gi, (match, s) => {
      return JSON.stringify(String(evalMath(s)).toLowerCase());
    });

    // 6. TRIM(str)
    subExpr = subExpr.replace(/TRIM\s*\(([^)]+)\)/gi, (match, s) => {
      return JSON.stringify(String(evalMath(s)).trim());
    });

    // 7. LEN(str)
    subExpr = subExpr.replace(/LEN\s*\(([^)]+)\)/gi, (match, s) => {
      return String(String(evalMath(s)).length);
    });

    // Replace single '=' with '==' and '<>' with '!=' for JS engine evaluation, except when inside Lookbehind
    let safeSubExpr = subExpr;
    safeSubExpr = safeSubExpr.replace(/(?<![<>=])=(?![=])/g, "==");
    safeSubExpr = safeSubExpr.replace(/<>/g, "!=");

    try {
      // safe eval using Function
      const result = new Function(`return (${safeSubExpr});`)();
      return result;
    } catch (err) {
      return trimmed;
    }
  };

  // Robust paren-aware IF evaluator
  while (true) {
    const ifMatch = expr.match(/IF\s*\(/i);
    if (!ifMatch) break;

    const startIdx = ifMatch.index!;
    const openParenIdx = startIdx + ifMatch[0].length - 1;
    
    // Find the matching closing parenthesis for this IF
    let parenDepth = 0;
    let closeParenIdx = -1;
    let insideQuotes = false;
    for (let j = openParenIdx; j < expr.length; j++) {
      const c = expr[j];
      if ((c === '"' || c === "'") && (j === 0 || expr.charCodeAt(j - 1) !== 92)) {
        insideQuotes = !insideQuotes;
      }
      if (!insideQuotes) {
        if (c === '(') parenDepth++;
        if (c === ')') {
          parenDepth--;
          if (parenDepth === 0) {
            closeParenIdx = j;
            break;
          }
        }
      }
    }

    if (closeParenIdx === -1) {
      break;
    }

    const fullMatch = expr.substring(startIdx, closeParenIdx + 1);
    const inner = expr.substring(openParenIdx + 1, closeParenIdx);

    // Split inner into arguments by comma, respecting paren depth and quotes
    const args: string[] = [];
    let temp = "";
    let depth = 0;
    let inQuotes = false;
    for (let k = 0; k < inner.length; k++) {
      const char = inner[k];
      if ((char === '"' || char === "'") && (k === 0 || inner.charCodeAt(k - 1) !== 92)) {
        inQuotes = !inQuotes;
      }
      if (char === ',' && depth === 0 && !inQuotes) {
        args.push(temp.trim());
        temp = "";
      } else {
        if (char === '(') depth++;
        if (char === ')') depth--;
        temp += char;
      }
    }
    args.push(temp.trim());

    if (args.length >= 2) {
      const cond = args[0];
      const trueValStr = args[1];
      const falseValStr = args[2] || '""';

      const condResult = !!evalMath(cond);
      const resolvedVal = condResult ? evalMath(trueValStr) : evalMath(falseValStr);
      const stringified = typeof resolvedVal === "string" ? `"${resolvedVal}"` : String(resolvedVal);
      
      expr = expr.substring(0, startIdx) + stringified + expr.substring(closeParenIdx + 1);
    } else {
      break;
    }
  }

  if (expr.toUpperCase().startsWith("SWITCH")) {
    const innerIdx = expr.indexOf("(");
    const lastIdx = expr.lastIndexOf(")");
    if (innerIdx !== -1 && lastIdx !== -1) {
      const inner = expr.substring(innerIdx + 1, lastIdx);
      const args: string[] = [];
      let temp = "";
      let depth = 0;
      let inQuotes = false;
      for (let i = 0; i < inner.length; i++) {
        const char = inner[i];
        if ((char === '"' || char === "'") && (i === 0 || inner.charCodeAt(i - 1) !== 92)) {
          inQuotes = !inQuotes;
        }
        if (char === "," && !inQuotes && depth === 0) {
          args.push(temp.trim());
          temp = "";
        } else {
          temp += char;
          if (char === "(") depth++;
          if (char === ")") depth--;
        }
      }
      args.push(temp.trim());

      if (args.length >= 3) {
        const switchVal = evalMath(args[0]);
        let found = false;
        let result: any = null;
        for (let i = 1; i < args.length - 1; i += 2) {
          const caseVal = evalMath(args[i]);
          if (String(caseVal) === String(switchVal)) {
            result = evalMath(args[i + 1]);
            found = true;
            break;
          }
        }
        if (!found) {
          result = evalMath(args[args.length - 1]);
        }
        return result;
      }
    }
  }

  return evalMath(expr);
}

// ==========================================
// 4. CORE CONDITIONAL FORMATTING FRAMEWORK
// ==========================================

export function evaluateCFFramework(
  row: {
    cleanName: string;
    actual: number;
    budget: number;
    isSubtotal: boolean;
    isGrandTotal: boolean;
    level: number;
  },
  colId: "name" | "actual" | "budget" | "variance" | "variancePct",
  cellValue: string | number,
  rules: CFRule[],
  daxMeasures: DAXMeasure[]
): CellStyle {
  // 1. Establish the merged style object accumulator
  const finalStyle: CellStyle = {};

  // If there are no rules, return empty style immediately
  if (!rules || rules.length === 0) {
    return finalStyle;
  }

  // 2. Prepare Context for Expression Engine evaluation
  const variance = row.actual - row.budget;
  const variancePct = row.budget !== 0 ? (variance / row.budget) * 100 : 0;
  
  const context: Record<string, any> = {
    AccountCode: row.cleanName,
    Account: row.cleanName,
    Code: row.cleanName,
    Description: row.cleanName,
    Name: row.cleanName,
    Category: row.cleanName,
    Sales: row.actual,
    Actual: row.actual,
    Budget: row.budget,
    Variance: variance,
    Profit: variance,
    VariancePct: variancePct,
    Quantity: Math.abs(row.actual) / 100, // Dummy fallback metric
  };

  // 3. Filters & sorts active rules according to execution pipeline:
  // - Engine type priority sequence: Rule (0) -> Text (1) -> Expression (2) -> Measure (3)
  // - Priority order within identical engine tier (Smaller numbers override larger numbers, e.g. Priority 1 overrides Priority 3)
  const enginePriorityOrder = { rule: 0, text: 1, expression: 2, measure: 3 };

  const sortedRules = rules
    .filter((r) => r.isEnabled)
    .sort((a, b) => {
      const aEngineVal = enginePriorityOrder[a.engine] ?? 99;
      const bEngineVal = enginePriorityOrder[b.engine] ?? 99;
      
      if (aEngineVal !== bEngineVal) {
        return aEngineVal - bEngineVal; // Low values (e.g. rule: 0) execute first
      }
      
      // Same engine: high number (e.g. Priority 3) applies first, then low number (e.g. Priority 1) applies last, overriding previous styles.
      return b.priority - a.priority;
    });

  // 4. Cascade execution through the sorted rules
  for (const rule of sortedRules) {
    // Check Targets validity
    let targetMatch = false;

    if (rule.targetType === "grandtotal" && row.isGrandTotal) {
      targetMatch = true;
    } else if (rule.targetType === "subtotal" && row.isSubtotal) {
      targetMatch = true;
    } else if (rule.targetType === "node" && !row.isSubtotal && !row.isGrandTotal && row.level === 0) {
      targetMatch = true;
    } else if (rule.targetType === "column" && !row.isSubtotal && !row.isGrandTotal) {
      targetMatch = rule.targetColumn === "all" || rule.targetColumn === colId;
    } else if (rule.targetType === "cell") {
      const colMatches = rule.targetColumn === "all" || rule.targetColumn === colId;
      const rowMatches = !rule.targetRowHeader || rule.targetRowHeader === "all" || row.cleanName.toLowerCase() === rule.targetRowHeader.toLowerCase();
      targetMatch = colMatches && rowMatches;
    } else if (rule.targetType === "row" && !row.isSubtotal && !row.isGrandTotal) {
      // Entire row target applies to any cell on this row
      targetMatch = true;
    }

    if (!targetMatch) continue;

    let isMatch = false;

    // Evaluate Engine Specific Match Criteria
    if (rule.engine === "rule") {
      // Numeric or Boolean conditions
      const field = rule.ruleField || "actual";
      let valToCompare = 0;
      if (field === "actual") valToCompare = row.actual;
      else if (field === "budget") valToCompare = row.budget;
      else if (field === "variance") valToCompare = variance;
      else if (field === "variancePct") valToCompare = variancePct;

      const compareNum = Number(rule.ruleValue1) || 0;
      const compareNum2 = Number(rule.ruleValue2) || 0;

      switch (rule.ruleOperator) {
        case "greater":
          isMatch = valToCompare > compareNum;
          break;
        case "less":
          isMatch = valToCompare < compareNum;
          break;
        case "greaterEqual":
          isMatch = valToCompare >= compareNum;
          break;
        case "lessEqual":
          isMatch = valToCompare <= compareNum;
          break;
        case "equal":
          isMatch = valToCompare === compareNum;
          break;
        case "notEqual":
          isMatch = valToCompare !== compareNum;
          break;
        case "between":
          isMatch = valToCompare >= compareNum && valToCompare <= compareNum2;
          break;
        case "notBetween":
          isMatch = valToCompare < compareNum || valToCompare > compareNum2;
          break;
        case "inList": {
          const list = (rule.ruleValue1 || "")
            .split(",")
            .map((s) => Number(s.trim()))
            .filter((n) => !isNaN(n));
          isMatch = list.includes(valToCompare);
          break;
        }
      }
    } else if (rule.engine === "text") {
      // Text engine
      const textSource = rule.textField === "description" ? row.cleanName : row.cleanName;
      const sVal = textSource.toLowerCase();
      const matchVal = (rule.textValue || "").toLowerCase();

      switch (rule.textOperator) {
        case "startsWith":
          isMatch = sVal.startsWith(matchVal);
          break;
        case "endsWith":
          isMatch = sVal.endsWith(matchVal);
          break;
        case "contains":
          isMatch = sVal.includes(matchVal);
          break;
        case "equals":
          isMatch = sVal === matchVal;
          break;
        case "notEquals":
          isMatch = sVal !== matchVal;
          break;
        case "regex": {
          try {
            const re = new RegExp(rule.textValue || "");
            isMatch = re.test(textSource);
          } catch {
            isMatch = false;
          }
          break;
        }
        case "isEmpty":
          isMatch = textSource.trim() === "";
          break;
        case "isNotEmpty":
          isMatch = textSource.trim() !== "";
          break;
      }
    } else if (rule.engine === "expression") {
      // Custom Expression Parser Engine
      if (rule.expressionString) {
        try {
          const tokens = tokenize(rule.expressionString);
          const parser = new Parser(tokens);
          const ast = parser.parse();
          if (ast && ast.type !== "Error") {
            isMatch = !!evaluateAST(ast, context);
          }
        } catch {
          isMatch = false;
        }
      }
    } else if (rule.engine === "measure") {
      // DAX Measure-Based Engine
      if (rule.measureId) {
        const measure = daxMeasures.find((m) => m.id === rule.measureId);
        if (measure) {
          const daxVal = evaluateDAXLocal(measure.formula, row.actual, row.budget, row);
          
          // DAX is the absolute last step and can directly return visual values
          if (rule.measureTargetProperty === "allStyles") {
            // Check if string returned is JSON or a single Hex Code
            const daxStr = String(daxVal).trim();
            if (daxStr.startsWith("{") && daxStr.endsWith("}")) {
              try {
                const parsed = JSON.parse(daxStr);
                Object.assign(finalStyle, parsed);
                continue; // Styles directly merged
              } catch {
                // Not a valid JSON, default fallback to coloring background if it's hex
              }
            }
            if (/^#[0-9A-Fa-f]{3,8}$/.test(daxStr) || /^(red|green|blue|black|white|purple|yellow|orange|grey|gray)$/i.test(daxStr)) {
              finalStyle.background = daxStr;
            }
          } else if (rule.measureTargetProperty === "background") {
            finalStyle.background = String(daxVal);
          } else if (rule.measureTargetProperty === "foreground") {
            finalStyle.foreground = String(daxVal);
          } else if (rule.measureTargetProperty === "icon") {
            finalStyle.icon = String(daxVal);
          } else if (rule.measureTargetProperty === "borderColor") {
            finalStyle.borderColor = String(daxVal);
          } else if (rule.measureTargetProperty === "fontWeight") {
            finalStyle.fontWeight = String(daxVal);
          } else if (rule.measureTargetProperty === "opacity") {
            finalStyle.opacity = Number(daxVal) || 1;
          } else if (rule.measureTargetProperty === "tooltip") {
            finalStyle.tooltip = String(daxVal);
          }
        }
      }
      continue; // Skip standard style assignment since it's processed dynamically above
    }

    // Apply rule styles if matching
    if (isMatch) {
      if (rule.style.background !== undefined) finalStyle.background = rule.style.background;
      if (rule.style.foreground !== undefined) finalStyle.foreground = rule.style.foreground;
      if (rule.style.fontWeight !== undefined) finalStyle.fontWeight = rule.style.fontWeight;
      if (rule.style.fontStyle !== undefined) finalStyle.fontStyle = rule.style.fontStyle;
      if (rule.style.textDecoration !== undefined) finalStyle.textDecoration = rule.style.textDecoration;
      if (rule.style.icon !== undefined) finalStyle.icon = rule.style.icon;
      if (rule.style.svgIcon !== undefined) finalStyle.svgIcon = rule.style.svgIcon;
      if (rule.style.borderColor !== undefined) finalStyle.borderColor = rule.style.borderColor;
      if (rule.style.borderThickness !== undefined) finalStyle.borderThickness = rule.style.borderThickness;
      if (rule.style.borderRadius !== undefined) finalStyle.borderRadius = rule.style.borderRadius;
      if (rule.style.fontSize !== undefined) finalStyle.fontSize = rule.style.fontSize;
      if (rule.style.fontFamily !== undefined) finalStyle.fontFamily = rule.style.fontFamily;
      if (rule.style.opacity !== undefined) finalStyle.opacity = rule.style.opacity;
      if (rule.style.padding !== undefined) finalStyle.padding = rule.style.padding;
      if (rule.style.rowHeight !== undefined) finalStyle.rowHeight = rule.style.rowHeight;
      if (rule.style.tooltip !== undefined) finalStyle.tooltip = rule.style.tooltip;
      if (rule.style.cursor !== undefined) finalStyle.cursor = rule.style.cursor;
      if (rule.style.animation !== undefined) finalStyle.animation = rule.style.animation;
    }
  }

  return finalStyle;
}
