export interface TreeNode {
  label?: string;
  length?: number;
  children: TreeNode[];
}

type LBracketToken = { type: "(" };
type RBracketToken = { type: ")" };
type CommaToken = { type: "," };
type ColonToken = { type: ":" };
type SemicolonToken = { type: ";" };
type NumLiteralToken = { type: "num"; value: number };
type StrLiteralToken = { type: "str"; value: string };

type Token =
  | LBracketToken
  | RBracketToken
  | CommaToken
  | ColonToken
  | SemicolonToken
  | NumLiteralToken
  | StrLiteralToken;

const reNum = new RegExp("[0-9]");
const reNumDot = new RegExp("[0-9.]");

const reStr = new RegExp("[a-zA-Z]");

class Iterator {
  private idx = 0;

  constructor(private inner: string) {}

  end = (): boolean => {
    if (this.idx >= this.inner.length) {
      return true;
    }

    return false;
  };

  peek = (): string | null => {
    if (this.end()) {
      return null;
    }

    return this.inner.charAt(this.idx);
  };

  next = (): string | null => {
    if (this.end()) {
      return null;
    }

    return this.inner.charAt(this.idx++);
  };
}

class Tokeniser {
  private it: Iterator;

  constructor(str: string) {
    this.it = new Iterator(str);
  }

  end = (): boolean => {
    return this.it.end();
  };

  next = (): Token | null => {
    if (this.end()) {
      return null;
    }

    const next = this.it.peek() as string;

    //
    if (next === "(") {
      return this.parseLBracket();
    }

    if (next === ")") {
      return this.parseRBracket();
    }

    if (next === ",") {
      return this.parseComma();
    }

    if (next === ":") {
      return this.parseColon();
    }

    if (next === ";") {
      return this.parseSemicolon();
    }

    if (reNum.test(next)) {
      return this.parseNumLiteral();
    }

    if (reStr.test(next)) {
      return this.parseStrLiteral();
    }

    return null;
  };

  //
  private parseLBracket = (): LBracketToken => {
    this.it.next();

    return {
      type: "(",
    };
  };

  private parseRBracket = (): RBracketToken => {
    this.it.next();

    return {
      type: ")",
    };
  };

  private parseComma = (): CommaToken => {
    this.it.next();

    return {
      type: ",",
    };
  };

  private parseColon = (): ColonToken => {
    this.it.next();

    return {
      type: ":",
    };
  };

  private parseSemicolon = (): SemicolonToken => {
    this.it.next();

    return {
      type: ";",
    };
  };

  private parseNumLiteral = (): NumLiteralToken => {
    let num = "";

    do {
      num += this.it.next();

      if (this.end()) {
        throw Error("error parsing num literal, unexpected end of tree");
      }
    } while (reNumDot.test(this.it.peek() as string));

    return {
      type: "num",
      value: parseFloat(num),
    };
  };

  private parseStrLiteral = (): StrLiteralToken => {
    let str = "";

    do {
      str += this.it.next();

      if (this.end()) {
        throw Error("error parsing str literal, unexpected end of tree");
      }
    } while (reNumDot.test(this.it.peek() as string));

    return {
      type: "str",
      value: str,
    };
  };
}

class TreeBuilder {
  private tokeniser: Tokeniser;

  constructor(str: string) {
    this.tokeniser = new Tokeniser(str);
  }

  build = (): TreeNode => {
    // start
    if () {

    }

    // end

    const tokens: Token[] = [];

    while (!this.tokeniser.end()) {
      const token = this.tokeniser.next() as Token;

      if (token.type === ",") {
        break;
      }

      if (token.type === "(") {
        break;
      }

      tokens.push(token);
    }

    console.log(tokens);
  };
}

export const parseNewick = (tree: string): TreeNode => {
  const builder = new TreeBuilder(tree);

  return builder.build();
};
