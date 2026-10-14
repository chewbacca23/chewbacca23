(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GoodThoughts = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var STORAGE_KEY = "good-thoughts-v1";
  var MAX_NOTES = 40;
  var MIN_LENGTH = 8;
  var MAX_LENGTH = 240;
  var MIN_GAP_MS = 8000;

  var POSITIVE_PHRASES = [
    "not bad",
    "isn't bad",
    "isnt bad",
    "no complaints",
    "well done",
    "good job",
    "made my day",
    "made me smile",
    "good vibes",
    "good vibe",
    "big fan",
    "huge fan",
    "so good",
    "love this",
    "love it",
    "very cool",
    "so cool",
    "so nice"
  ];

  var POSITIVE_WORDS = [
    "awesome",
    "amazing",
    "love",
    "loved",
    "lovely",
    "loving",
    "great",
    "greatest",
    "wonderful",
    "brilliant",
    "beautiful",
    "cool",
    "nice",
    "kind",
    "kindness",
    "happy",
    "happiness",
    "smile",
    "smiling",
    "joy",
    "joyful",
    "fantastic",
    "excellent",
    "good",
    "sweet",
    "warm",
    "warmth",
    "bright",
    "fun",
    "funny",
    "delightful",
    "delight",
    "gorgeous",
    "impressive",
    "wholesome",
    "thank",
    "thanks",
    "wow",
    "favorite",
    "favourite",
    "enjoy",
    "enjoyed",
    "enjoying",
    "perfect",
    "stunning",
    "charming",
    "friendly",
    "helpful",
    "proud",
    "inspiring",
    "inspired",
    "inspire",
    "cheers",
    "respect",
    "admire",
    "admired",
    "rad",
    "legend",
    "yay",
    "hooray",
    "congrats",
    "congratulations",
    "superb",
    "outstanding",
    "magnificent",
    "marvelous",
    "marvellous",
    "terrific",
    "positive",
    "positivity",
    "uplifting",
    "appreciate",
    "appreciated",
    "grateful",
    "glad",
    "sunshine",
    "cute",
    "heartwarming",
    "lovely",
    "toll",
    "wunderbar",
    "schön",
    "schoen",
    "danke",
    "liebe",
    "lieb",
    "klasse",
    "spitze",
    "freude",
    "froh",
    "herzlich",
    "wunderschön",
    "wunderschon",
    "großartig",
    "grossartig",
    "fantastisch",
    "prima",
    "herrlich",
    "begeistert",
    "genial",
    "hammer",
    "super",
    "lecker",
    "stark"
  ];

  var POSITIVE_EMOJI = [
    "❤",
    "♥",
    "✨",
    "🌟",
    "⭐",
    "🔥",
    "😊",
    "😄",
    "😁",
    "🥰",
    "😍",
    "🤩",
    "😎",
    "👍",
    "👏",
    "🙌",
    "💯",
    "🎉",
    "☀",
    "🌞",
    "💛",
    "💚",
    "💙",
    "💜",
    "🧡",
    "🤍",
    "💖"
  ];

  var SHARP_PHRASES = [
    "you should",
    "should have",
    "should've",
    "shouldve",
    "know better",
    "knows better",
    "could be better",
    "needs work",
    "needs improvement",
    "might want to",
    "consider changing",
    "fix this",
    "i would have",
    "i would've",
    "if i were you",
    "do it this way",
    "don't like",
    "dont like",
    "not good",
    "not great",
    "not cool",
    "not nice",
    "not awesome",
    "not amazing",
    "nobody cares",
    "no one cares",
    "shut up",
    "whatever",
    "who asked",
    "try hard"
  ];

  var SHARP_WORDS = [
    "hate",
    "hated",
    "hater",
    "haters",
    "stupid",
    "idiot",
    "idiotic",
    "dumb",
    "dumbass",
    "sucks",
    "suck",
    "worst",
    "trash",
    "garbage",
    "crap",
    "useless",
    "annoying",
    "boring",
    "awful",
    "terrible",
    "horrible",
    "ugly",
    "lame",
    "pathetic",
    "loser",
    "moron",
    "cringe",
    "cringy",
    "overrated",
    "waste",
    "disappointing",
    "disappointed",
    "nonsense",
    "bullshit",
    "wtf",
    "stfu",
    "gross",
    "disgusting",
    "nasty",
    "rude",
    "jerk",
    "asshole",
    "bastard",
    "scam",
    "fraud",
    "fake",
    "liar",
    "pretentious",
    "meh",
    "yawn",
    "complaint",
    "complain",
    "complaining",
    "angry",
    "furious",
    "unhappy",
    "dislike",
    "mid",
    "bad",
    "worse",
    "fail",
    "failed",
    "failure",
    "broken",
    "spam",
    "hates"
  ];

  var MESSAGES = {
    short: "Give it a real sentence. A little warmth is enough.",
    long: "Keep it short and sweet. A sentence or two lands best.",
    link: "Skip the link. A kind sentence is enough.",
    sharp: "That one has a sharp edge. This wall is for good vibes.",
    warmth: "Tell us what you like. A positive thought is what gets approved.",
    fast: "Easy. One kind note at a time.",
    ok: "Approved. It is on the wall."
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function hasWord(text, word) {
    var escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var re = new RegExp("(?:^|[^\\p{L}\\p{N}])" + escaped + "(?:$|[^\\p{L}\\p{N}])", "iu");
    return re.test(text);
  }

  function hasAnyWord(text, words) {
    for (var i = 0; i < words.length; i += 1) {
      if (hasWord(text, words[i])) return true;
    }
    return false;
  }

  function hasAnyPhrase(text, phrases) {
    for (var i = 0; i < phrases.length; i += 1) {
      if (text.indexOf(phrases[i]) !== -1) return true;
    }
    return false;
  }

  function hasEmoji(text) {
    for (var i = 0; i < POSITIVE_EMOJI.length; i += 1) {
      if (text.indexOf(POSITIVE_EMOJI[i]) !== -1) return true;
    }
    return false;
  }

  function judge(raw) {
    var text = normalize(raw);
    if (!text || text.length < MIN_LENGTH) {
      return { ok: false, reason: "short" };
    }
    if (text.length > MAX_LENGTH) {
      return { ok: false, reason: "long" };
    }
    if (/https?:\/\/|www\./i.test(text) || /[<>]/.test(text)) {
      return { ok: false, reason: "link" };
    }

    var scanned = text.replace(/\bkind of\b/g, " ");
    POSITIVE_PHRASES.forEach(function (phrase) {
      scanned = scanned.split(phrase).join(" ");
    });

    if (hasAnyPhrase(scanned, SHARP_PHRASES) || hasAnyWord(scanned, SHARP_WORDS)) {
      return { ok: false, reason: "sharp" };
    }

    var warm =
      hasAnyPhrase(text, POSITIVE_PHRASES) ||
      hasAnyWord(text, POSITIVE_WORDS) ||
      hasEmoji(raw || "");

    if (!warm) {
      return { ok: false, reason: "warmth" };
    }

    return { ok: true, reason: "ok" };
  }

  function cleanName(raw) {
    var name = String(raw || "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);
    if (!name) return "a friend";
    if (/https?:\/\/|www\.|[<>]/.test(name.toLowerCase())) return "a friend";
    if (!/^[\p{L}\p{N}][\p{L}\p{N} .'-]*$/u.test(name)) return "a friend";
    return name;
  }

  function isNote(value) {
    return (
      value &&
      typeof value.id === "string" &&
      typeof value.name === "string" &&
      typeof value.text === "string" &&
      typeof value.page === "string" &&
      typeof value.createdAt === "number"
    );
  }

  function createStore(adapter) {
    function read() {
      var raw = adapter.get(STORAGE_KEY);
      if (!raw) return [];
      try {
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isNote);
      } catch (error) {
        return [];
      }
    }

    function write(notes) {
      adapter.set(STORAGE_KEY, JSON.stringify(notes.slice(0, MAX_NOTES)));
    }

    return {
      list: function () {
        return read().sort(function (a, b) {
          return b.createdAt - a.createdAt;
        });
      },
      add: function (note) {
        var next = [note].concat(read()).slice(0, MAX_NOTES);
        write(next);
        return next;
      }
    };
  }

  function browserStore() {
    return createStore({
      get: function (key) {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          return null;
        }
      },
      set: function (key, value) {
        localStorage.setItem(key, value);
      }
    });
  }

  function mailtoHref(email, note) {
    var body = [
      note.name + " left a good thought on " + note.page + ".",
      "",
      note.text
    ].join("\n");
    return (
      "mailto:" +
      email +
      "?subject=" +
      encodeURIComponent("a good thought") +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function formatWhen(timestamp) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric"
      }).format(new Date(timestamp));
    } catch (error) {
      return "";
    }
  }

  function mount(container, options) {
    var page = (options && options.page) || "this page";
    var email = (options && options.email) || "";
    var store = (options && options.store) || browserStore();
    var now = (options && options.now) || function () {
      return Date.now();
    };

    container.textContent = "";

    var kicker = el("p", "wall-kicker", "on every page");
    var title = el("h2", "wall-title", "good thoughts");
    title.id = "good-thoughts-title";
    var policy = el(
      "p",
      "wall-policy",
      "Only positive thoughts get approved. Say it with a good vibe and it stays up, on this page and the next one."
    );

    var form = document.createElement("form");
    form.className = "wall-form";
    form.setAttribute("novalidate", "novalidate");

    var nameLabel = el("label", "field");
    nameLabel.appendChild(el("span", "field-label", "name"));
    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.maxLength = 24;
    nameInput.autocomplete = "nickname";
    nameInput.placeholder = "optional";
    nameLabel.appendChild(nameInput);

    var thoughtLabel = el("label", "field");
    thoughtLabel.appendChild(el("span", "field-label", "your thought"));
    var thoughtInput = document.createElement("textarea");
    thoughtInput.name = "thought";
    thoughtInput.required = true;
    thoughtInput.maxLength = MAX_LENGTH;
    thoughtInput.rows = 3;
    thoughtInput.placeholder = "this page feels awesome";
    thoughtLabel.appendChild(thoughtInput);

    var actions = el("div", "wall-actions");
    var button = document.createElement("button");
    button.type = "submit";
    button.className = "send-button";
    button.textContent = "leave a good thought";
    actions.appendChild(button);

    var hint = el(
      "p",
      "wall-hint",
      "English or German. Kind words get approved. Sharp takes stay outside."
    );

    form.appendChild(nameLabel);
    form.appendChild(thoughtLabel);
    form.appendChild(actions);
    form.appendChild(hint);

    var status = el("p", "wall-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    var sendRow = el("p", "wall-send");
    sendRow.hidden = true;

    var list = document.createElement("ol");
    list.className = "note-list";

    var empty = el("p", "wall-empty", "The wall is quiet. A kind sentence opens it.");

    container.appendChild(kicker);
    container.appendChild(title);
    container.appendChild(policy);
    container.appendChild(form);
    container.appendChild(status);
    container.appendChild(sendRow);
    container.appendChild(empty);
    container.appendChild(list);

    function render() {
      var notes = store.list();
      list.textContent = "";
      empty.hidden = notes.length > 0;
      notes.forEach(function (note) {
        var item = document.createElement("li");
        item.className = "note";
        var top = el("div", "note-top");
        top.appendChild(el("span", "note-name", note.name));
        top.appendChild(el("span", "note-meta", note.page + " · " + formatWhen(note.createdAt)));
        item.appendChild(top);
        item.appendChild(el("p", "note-text", note.text));
        list.appendChild(item);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendRow.hidden = true;
      sendRow.textContent = "";

      var verdict = judge(thoughtInput.value);
      if (!verdict.ok) {
        status.className = "wall-status is-held";
        status.textContent = MESSAGES[verdict.reason] || MESSAGES.warmth;
        return;
      }

      var notes = store.list();
      var latest = notes[0];
      if (latest && now() - latest.createdAt < MIN_GAP_MS) {
        status.className = "wall-status is-held";
        status.textContent = MESSAGES.fast;
        return;
      }

      var note = {
        id: String(now()) + "-" + Math.random().toString(16).slice(2),
        name: cleanName(nameInput.value),
        text: String(thoughtInput.value || "").replace(/\s+/g, " ").trim(),
        page: page,
        createdAt: now()
      };
      store.add(note);
      thoughtInput.value = "";
      status.className = "wall-status is-approved";
      status.textContent = MESSAGES.ok;

      if (email) {
        var link = document.createElement("a");
        link.href = mailtoHref(email, note);
        link.textContent = "send this one to henrik";
        sendRow.hidden = false;
        sendRow.appendChild(link);
      }
      render();
    });

    render();
    return { render: render, judge: judge };
  }

  return {
    judge: judge,
    cleanName: cleanName,
    createStore: createStore,
    mount: mount,
    mailtoHref: mailtoHref,
    messages: MESSAGES
  };
});
