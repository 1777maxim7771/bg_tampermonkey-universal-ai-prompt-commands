// ==UserScript==
// @name         Tampermonkey Universal AI Prompt Commands BG
// @namespace    local.tampermonkey.universal.ai.prompt.commands.bg
// @version      1.0.0
// @description  Заменя кратки команди BG1-BG10 с готови AI промптове в AI чатове.
// @author       1777maxim7771
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Българска версия. Заменя се само точна команда с пълен промпт.
    const COMMANDS = {
        'BG1': `Преведи предоставения текст на български език пълно и точно. Запази смисъла, реда на информацията, имената, датите, сумите, номерата на документи, организациите и важните формулировки. Не добавяй собствени изводи и не съкращавай съдържанието.`,
        'BG2': `Обобщи предоставения текст на български език според смисъла и контекста. Обясни за какво става дума, кой на кого пише, каква е основната тема и какви искания, решения, дати, срокове, суми или важни подробности са посочени.`,
        'BG3': `Направи на български много кратко тематично резюме на това писмо, строго в един ред. Посочи подателя, темата, какво се съобщава или изисква и кои дати, срокове, суми, документи или действия са важни.`,
        'BG4': `Преведи предоставения текст на прост и разбираем немски език, ниво A2-B1. Формулирай текста учтиво, официално и граматически правилно. Запази смисъла, имената, датите, сумите, адресите, организациите и важните подробности.`,
        'BG5': `Коригирай предоставения български текст. Направи го граматически правилен, ясен, логичен и естествен, като запазиш първоначалния смисъл. Премахни грешки, повторения и неподходящи формулировки. Не добавяй факти, които не са в оригиналния текст.`,
        'BG6': `Напиши кратък, учтив и официален отговор на това писмо на български език. Отговори конкретно по съдържанието, без излишни фрази. Ако е необходимо, потвърди получаване, поискай уточнение, посочи документи или съобщи исканата информация.`,
        'BG7': `Обясни на български с прости думи какво означава този текст. Анализирай контекста, кой пише, на кого, по каква тема, какво се изисква, какво трябва да се направи и кои дати, срокове, суми, документи или условия са важни.`,
        'BG8': `Извлечи от текста всички важни факти и ги структурирай на български език. Посочи отделно лица, организации, адреси, дати, срокове, суми, номера на документи, изисквания, решения, задължения, споменати документи и следващи стъпки. Не измисляй информация.`,
        'BG9': `Състави на български ясен списък с необходимите действия въз основа на този текст. Посочи какво трябва да се направи, какви документи да се подготвят, на кого да се отговори, къде да се обърне човек, какви срокове да се спазят и на какво да се обърне внимание. Подреди по приоритет.`,
        'BG10': `Състави въз основа на предоставения текст учтиво официално писмо на прост немски език, ниво A2-B1. Запази имената, датите, сумите, адресите, организациите, номерата на документи и обстоятелствата. Структурирай писмото с обръщение, кратко обяснение, основна молба и завършек. Завърши с: Mit freundlichen Grüßen`
    };

    const EDITABLE_SELECTORS = ['textarea', 'input[type="text"]', 'input[type="search"]', '[contenteditable="true"]', '[contenteditable="plaintext-only"]', '[role="textbox"]'];
    function isEditableElement(element) { if (!element || !element.matches) return false; if (element.disabled || element.readOnly) return false; const tagName = element.tagName ? element.tagName.toLowerCase() : ''; const inputType = (element.getAttribute('type') || '').toLowerCase(); if (tagName === 'input' && !['text', 'search'].includes(inputType)) return false; return EDITABLE_SELECTORS.some(selector => element.matches(selector)); }
    function findEditableElement(target) { if (!target) return null; if (isEditableElement(target)) return target; if (target.closest) { const element = target.closest(EDITABLE_SELECTORS.join(',')); if (isEditableElement(element)) return element; } return null; }
    function getText(element) { const tagName = element.tagName ? element.tagName.toLowerCase() : ''; return tagName === 'textarea' || tagName === 'input' ? element.value || '' : element.innerText || element.textContent || ''; }
    function normalizeCommand(text) { return String(text || '').trim().replace(/\s+/g, '').toUpperCase(); }
    function dispatchInputEvents(element, text) { try { element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertReplacementText', data: text })); } catch (error) { element.dispatchEvent(new Event('input', { bubbles: true })); } element.dispatchEvent(new Event('change', { bubbles: true })); }
    function setCursorToEnd(element) { element.focus(); if ('selectionStart' in element) { const length = element.value.length; element.setSelectionRange(length, length); return; } const range = document.createRange(); const selection = window.getSelection(); range.selectNodeContents(element); range.collapse(false); selection.removeAllRanges(); selection.addRange(range); }
    function replaceText(element, newText) { const tagName = element.tagName ? element.tagName.toLowerCase() : ''; element.focus(); if (tagName === 'textarea' || tagName === 'input') { element.value = newText; } else { try { const range = document.createRange(); const selection = window.getSelection(); range.selectNodeContents(element); selection.removeAllRanges(); selection.addRange(range); document.execCommand('insertText', false, newText); } catch (error) { element.textContent = newText; } } setCursorToEnd(element); dispatchInputEvents(element, newText); }
    function showNotification(message) { const oldBox = document.getElementById('tm-ai-prompt-commands-notification'); if (oldBox) oldBox.remove(); const box = document.createElement('div'); box.id = 'tm-ai-prompt-commands-notification'; box.textContent = message; box.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:999999;background:#111;color:#fff;padding:12px 18px;border-radius:10px;font:14px Arial,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.35);max-width:420px;line-height:1.4'; document.body.appendChild(box); setTimeout(() => box.remove(), 2200); }
    function checkAndReplace(target) { const editable = findEditableElement(target); if (!editable) return; const command = normalizeCommand(getText(editable)); if (!Object.prototype.hasOwnProperty.call(COMMANDS, command)) return; replaceText(editable, COMMANDS[command]); showNotification(`Командата ${command} е заменена с готов AI промпт`); }
    document.addEventListener('input', event => setTimeout(() => checkAndReplace(event.target), 20), true);
    document.addEventListener('keyup', event => setTimeout(() => checkAndReplace(event.target), 20), true);
    document.addEventListener('paste', event => setTimeout(() => checkAndReplace(event.target), 50), true);
})();