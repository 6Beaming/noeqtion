const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const source = `${fs.readFileSync("content.js", "utf8")}
globalThis.testApi = { EQUATION_REGEX, normalizeEquationInput };`;
const context = {
  chrome: { runtime: { onMessage: { addListener() {} } } },
  console,
  document: { addEventListener() {} },
};

vm.createContext(context);
vm.runInContext(source, context);

const { EQUATION_REGEX, normalizeEquationInput } = context.testApi;

const equationCases = [
  ["$1+1=2$", "1+1=2"],
  ["$$1+1=2$$", "1+1=2"],
  ["\\(1+1=2\\)", "1+1=2"],
  ["\\[\n1+1=2\n\\]", "1+1=2"],
  [
    "\\[\nC_1\\oplus C_2\n=\n(M_1\\oplus K)\\oplus(M_2\\oplus K)\n\\]",
    "C_1\\oplus C_2 = (M_1\\oplus K)\\oplus(M_2\\oplus K)",
  ],
];

for (const [input, expectedContent] of equationCases) {
  test(`detects and normalizes ${JSON.stringify(input)}`, () => {
    const match = input.match(EQUATION_REGEX);

    assert.ok(match);
    assert.equal(match[0], input);
    assert.equal(
      normalizeEquationInput({ nodeValue: input }, input, 0).latexContent,
      expectedContent
    );
  });
}

test("does not match incomplete or multiline inline equations", () => {
  const nonEquations = ["plain text", "\\(unterminated", "$line\nbreak$"];

  for (const input of nonEquations) {
    assert.equal(input.match(EQUATION_REGEX), null);
  }
});
