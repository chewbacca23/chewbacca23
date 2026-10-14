const test = require("node:test");
const assert = require("node:assert/strict");
const wall = require("../docs/good-thoughts.js");

test("approves a plain kind thought", () => {
  assert.deepEqual(wall.judge("this page is awesome"), { ok: true, reason: "ok" });
});

test("approves german warmth", () => {
  assert.equal(wall.judge("danke, das ist wirklich wunderbar").ok, true);
  assert.equal(wall.judge("die seite ist wunderschön").ok, true);
});

test("approves not-bad when the rest is warm", () => {
  assert.equal(wall.judge("not bad at all, I really love it").ok, true);
});

test("holds back sharp and know-it-all notes", () => {
  assert.equal(wall.judge("this sucks and you should know better").reason, "sharp");
  assert.equal(wall.judge("awesome, but you should redo the whole thing").reason, "sharp");
  assert.equal(wall.judge("this is terrible honestly").reason, "sharp");
});

test("asks for warmth when a note is flat", () => {
  assert.equal(wall.judge("hello there friend").reason, "warmth");
  assert.equal(wall.judge("I looked at the page").reason, "warmth");
});

test("holds short notes, long notes, and links", () => {
  assert.equal(wall.judge("nice").reason, "short");
  assert.equal(wall.judge("awesome ".repeat(40)).reason, "long");
  assert.equal(wall.judge("your site is awesome https://example.com").reason, "link");
});

test("cleans names and falls back when a name is odd", () => {
  assert.equal(wall.cleanName("  ada  "), "ada");
  assert.equal(wall.cleanName(""), "a friend");
  assert.equal(wall.cleanName("https://spam.test"), "a friend");
  assert.equal(wall.cleanName("henrik!"), "a friend");
});

test("stores notes newest first and drops junk", () => {
  const memory = {};
  const store = wall.createStore({
    get(key) {
      return memory[key] || null;
    },
    set(key, value) {
      memory[key] = value;
    }
  });

  memory["good-thoughts-v1"] = JSON.stringify([{ nope: true }, "nope"]);
  assert.deepEqual(store.list(), []);

  store.add({
    id: "1",
    name: "ada",
    text: "this is lovely",
    page: "Home",
    createdAt: 10
  });
  store.add({
    id: "2",
    name: "bea",
    text: "so awesome",
    page: "About",
    createdAt: 20
  });

  const notes = store.list();
  assert.equal(notes[0].id, "2");
  assert.equal(notes[1].page, "Home");
});

test("builds a mailto that carries the approved thought", () => {
  const href = wall.mailtoHref("henrik@thenewsoulsearchers.de", {
    name: "ada",
    page: "Home",
    text: "this page is awesome"
  });
  assert.match(href, /^mailto:henrik@thenewsoulsearchers.de/);
  assert.match(decodeURIComponent(href), /this page is awesome/);
  assert.match(decodeURIComponent(href), /Home/);
});
