// ==UserScript==
// @name         Tampermonkey Universal AI Prompt Commands BG
// @namespace    local.tampermonkey.universal.ai.prompt.commands.bg
// @version      1.0.0
// @description  Tampermonkey скрипт за замяна на кратки команди с готови AI промптове в AI чатове.
// @author       1777maxim7771
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Localized commands: replacement occurs only for an exact command.
    const COMMANDS = {
        'BG1': `Преведи изцяло и точно предоставения текст на български език. Запази смисъла, реда, имената, датите, сумите, номерата на документи, организациите и важните формулировки. Не добавяй изводи, не съкращавай и не променяй съдържанието.`,

        'BG2': `Обобщи предоставения текст на български според смисъла и контекста. Обясни темата, участниците и основното съдържание. Отделно посочи исканията, решенията, датите, сроковете, сумите и важните подробности. Пиши ясно и кратко.`,

        'BG3': `Направи на български кратко тематично резюме на писмото строго в един ред. Посочи подателя, темата, съобщението или искането и важните дати, срокове, суми, документи или действия.`,

        'BG4': `Преведи предоставения текст на прост и ясен немски език, ниво A2-B1. Направи текста учтив, официален и граматически правилен. Запази смисъла, датите, имената, сумите, адресите, организациите и подробностите.`,

        'BG5': `Поправи предоставения текст на български. Направи го грамотен, ясен и логичен, като запазиш първоначалния смисъл. Премахни грешките, повторенията и несполучливите формулировки. За писмо използвай учтив и официален тон. Не добавяй факти.`,

        'BG6': `Напиши кратък, учтив и официален отговор на това писмо на прост немски език, ниво A2-B1. Отговори по същество и формулирай правилно потвържденията или исканията за документи и разяснения. Завърши с: Mit freundlichen Grüßen`,

        'BG7': `Обясни с прости думи на български какво означава текстът. Посочи кой пише, по какъв въпрос, какво иска, какво трябва да се направи и важните срокове, дати, суми, документи или условия. Уточни дали има искане, предупреждение, решение или информация.`,

        'BG8': `Извлечи всички важни факти и ги структурирай на български: хора, организации, адреси, дати, срокове, суми, номера на документи, изисквания, решения, задължения, документи и следващи стъпки. Не измисляй; напиши „не е посочено“, ако липсва информация.`,

        'BG9': `Състави на български ясен списък с необходимите действия според текста. Посочи документите, адресатите, контактите, сроковете и важните точки. Раздели ги на: спешно, важно, може по-късно. Посочи въпросите за уточняване.`,

        'BG10': `Състави въз основа на текста учтиво официално писмо на прост немски език, ниво A2-B1. Запази всички важни факти. Структура: обръщение, ситуация, основно искане или съобщение, евентуално искане за потвърждение или разяснение, завършек. Завърши с: Mit freundlichen Grüßen`
    };

    const EDITABLE_SELECTORS = ['textarea','input[type="text"]','input[type="search"]','[contenteditable="true"]','[contenteditable="plaintext-only"]','[role="textbox"]'];
    function isEditableElement(element) {
        if (!element || !element.matches || element.disabled || element.readOnly) return false;
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const inputType = (element.getAttribute('type') || '').toLowerCase();
        if (tagName === 'input' && !['text','search'].includes(inputType)) return false;
        return EDITABLE_SELECTORS.some(selector => element.matches(selector));
    }
    function findEditableElement(target) {
        if (!target) return null;
        if (isEditableElement(target)) return target;
        const element = target.closest ? target.closest(EDITABLE_SELECTORS.join(',')) : null;
        return isEditableElement(element) ? element : null;
    }
    function getText(element) {
        const tagName = element?.tagName?.toLowerCase() || '';
        return tagName === 'textarea' || tagName === 'input' ? (element.value || '') : (element?.innerText || element?.textContent || '');
    }
    function normalizeCommand(text) { return text.trim().replace(/\s+/g, '').toUpperCase(); }
    function dispatchInputEvents(element,text) {
        try { element.dispatchEvent(new InputEvent('input',{bubbles:true,cancelable:true,inputType:'insertReplacementText',data:text})); }
        catch (_) { element.dispatchEvent(new Event('input',{bubbles:true})); }
        element.dispatchEvent(new Event('change',{bubbles:true}));
    }
    function replaceText(element,newText) {
        const tagName=element.tagName?.toLowerCase() || ''; element.focus();
        if (tagName==='textarea' || tagName==='input') { element.value=newText; element.setSelectionRange(newText.length,newText.length); dispatchInputEvents(element,newText); return; }
        try { const range=document.createRange(), selection=window.getSelection(); range.selectNodeContents(element); selection.removeAllRanges(); selection.addRange(range); document.execCommand('insertText',false,newText); }
        catch (_) { element.textContent=newText; }
        dispatchInputEvents(element,newText);
    }
    function showNotification(message) {
        document.getElementById('tampermonkey-universal-ai-prompt-commands-notification')?.remove();
        const box=document.createElement('div'); box.id='tampermonkey-universal-ai-prompt-commands-notification'; box.textContent=message;
        Object.assign(box.style,{position:'fixed',right:'20px',bottom:'20px',zIndex:'999999',background:'#111',color:'#fff',padding:'12px 18px',borderRadius:'10px',fontSize:'14px',fontFamily:'Arial, sans-serif',boxShadow:'0 4px 12px rgba(0,0,0,.35)',maxWidth:'420px',lineHeight:'1.4'});
        document.body.appendChild(box); setTimeout(()=>box.remove(),2200);
    }
    function checkAndReplace(target) {
        const editable=findEditableElement(target); if (!editable) return;
        const command=normalizeCommand(getText(editable)); if (!Object.prototype.hasOwnProperty.call(COMMANDS,command)) return;
        replaceText(editable,COMMANDS[command]); showNotification("Командата {cmd} беше заменена с готов промпт".replace('{cmd}',command));
    }
    document.addEventListener('input',event=>setTimeout(()=>checkAndReplace(event.target),20),true);
    document.addEventListener('keyup',event=>setTimeout(()=>checkAndReplace(event.target),20),true);
    document.addEventListener('paste',event=>setTimeout(()=>checkAndReplace(event.target),50),true);
})();
