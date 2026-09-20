const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};

const passwordOutput = document.getElementById("password-output");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");
const generateBtn = document.getElementById("generate-btn");
const lengthInput = document.getElementById("length-input");
const optionCheckboxes = {
  uppercase: document.getElementById("opt-uppercase"),
  lowercase: document.getElementById("opt-lowercase"),
  numbers: document.getElementById("opt-numbers"),
  symbols: document.getElementById("opt-symbols"),
};

// Returns an unbiased random index in [0, max) using rejection sampling
// over crypto.getRandomValues, so the result isn't skewed like `% max` would be.
function secureRandomIndex(max) {
  const range = 256 - (256 % max);
  const bytes = new Uint8Array(1);
  let value;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= range);
  return value % max;
}

function secureShuffle(chars) {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
}

function generatePassword(length, enabledSets) {
  const activeSets = Object.entries(CHAR_SETS).filter(([key]) => enabledSets[key]);

  if (activeSets.length === 0) {
    return null;
  }

  const pool = activeSets.map(([, chars]) => chars).join("");
  const passwordChars = [];

  // Guarantee at least one character from each selected set.
  for (const [, chars] of activeSets) {
    passwordChars.push(chars[secureRandomIndex(chars.length)]);
  }

  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(pool[secureRandomIndex(pool.length)]);
  }

  return secureShuffle(passwordChars).slice(0, length).join("");
}

function getSelectedOptions() {
  return {
    uppercase: optionCheckboxes.uppercase.checked,
    lowercase: optionCheckboxes.lowercase.checked,
    numbers: optionCheckboxes.numbers.checked,
    symbols: optionCheckboxes.symbols.checked,
  };
}

function handleGenerate() {
  let length = parseInt(lengthInput.value, 10);
  if (Number.isNaN(length)) length = 16;
  length = Math.min(64, Math.max(4, length));
  lengthInput.value = length;

  const enabledSets = getSelectedOptions();
  const password = generatePassword(length, enabledSets);

  if (password === null) {
    passwordOutput.value = "";
    passwordOutput.placeholder = "Select at least one option";
    return;
  }

  passwordOutput.value = password;
  copyFeedback.classList.remove("visible");
  copyFeedback.textContent = "";
}

async function handleCopy() {
  if (!passwordOutput.value) return;

  try {
    await navigator.clipboard.writeText(passwordOutput.value);
  } catch (err) {
    passwordOutput.select();
    document.execCommand("copy");
  }

  copyFeedback.textContent = "Copied!";
  copyFeedback.classList.add("visible");
  setTimeout(() => copyFeedback.classList.remove("visible"), 1500);
}

generateBtn.addEventListener("click", handleGenerate);
copyBtn.addEventListener("click", handleCopy);

handleGenerate();
