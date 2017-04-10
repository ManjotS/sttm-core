/* eslint import/no-dynamic-require: 0, import/no-unresolved: 0 */
/* global Mousetrap, platform */
const globals = {};

globals.electron = false;
globals.cordova = false;
globals.platformScripts = 'js';

// Check if we're in Electron
if (window && window.process && window.process.type === 'renderer') {
  globals.electron = true;
}

const controller = require('../../js/controller.js');
const Settings = require('../../js/settings');
const search = require('./search');
const changelog = require('./changelog');
const h = require('hyperscript');

const settings = new Settings(platform.store);

const $mainUI = document.getElementById('main-ui');
const $shabad = document.getElementById('shabad');
const $shabadContainer = document.getElementById('shabad-container');
const $buttons = document.getElementById('buttons');
const $actions = document.querySelectorAll('.action');
const $headers = document.querySelectorAll('.block-list header');

window.onload = () => {
  search.$search.focus();
  changelog.checkChangelogVersion();
};

function clickButtons(e) {
  if (e.target.classList.contains('msg')) {
    const $msg = e.target;
    controller.sendText($msg.innerText);
  }
}

function clickLogo() {
  $mainUI.classList.remove('search');
  document.body.classList.add('home');
  search.$search.value = '';
  search.$search.focus();
}

function escKey() {
  if (settings.$settings.classList.contains('animated')) {
    settings.closeSettings();
  }
}

function highlightLine(newLine) {
  const $line = $shabad.querySelector(`#line${newLine}`);
  $line.click();
  const curPankteeTop = $line.parentNode.offsetTop;
  const curPankteeHeight = $line.parentNode.offsetHeight;
  const containerTop = $shabadContainer.scrollTop;
  const containerHeight = $shabadContainer.offsetHeight;

  if (containerTop > curPankteeTop) {
    $shabadContainer.scrollTop = curPankteeTop;
  }
  if (containerTop + containerHeight < curPankteeTop + curPankteeHeight) {
    $shabadContainer.scrollTop = (curPankteeTop - containerHeight) + curPankteeHeight;
  }
}

function spaceBar(e) {
  const mainLineID = $shabad.querySelector('a.panktee.main').dataset.lineId;
  highlightLine(mainLineID);
  e.preventDefault();
}

function prevLine() {
  // Find position of current line in Shabad
  const pos = search.currentShabad.indexOf(search.currentLine);
  if (pos > 0) {
    highlightLine(search.currentShabad[pos - 1]);
  }
}

function nextLine() {
  // Find position of current line in Shabad
  const pos = search.currentShabad.indexOf(search.currentLine);
  if (pos < (search.currentShabad.length - 1)) {
    highlightLine(search.currentShabad[pos + 1]);
  }
}

function clickHeader() {
  $mainUI.classList.toggle('search');
}

// Keyboard shortcuts
Mousetrap.bindGlobal('esc', escKey);
Mousetrap.bind(['up', 'left'], prevLine);
Mousetrap.bind(['down', 'right'], nextLine);
Mousetrap.bind('/', () => search.$search.focus(), 'keyup');
Mousetrap.bind('space', spaceBar);

// HTMLElements
document.querySelector('.name')
  .appendChild(h(
    'img.logo',
    {
      src: 'core/img/sttm_logo_beta.png',
      alt: 'STTM Logo',
      onclick: e => clickLogo(e),
    }));

// Event listeners
$buttons.addEventListener('click', clickButtons);
// Allow any link with "action" class to execute a function name in "data-action"
Array.from($actions).forEach(el => el.addEventListener('click', e => eval(`${el.dataset.action}()`)));
Array.from($headers).forEach(el => el.addEventListener('click', clickHeader));
