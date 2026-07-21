// ==UserScript==
// @name         Tampermonkey Universal AI Prompt Commands BG
// @namespace    local.tampermonkey.universal.ai.prompt.commands.bg
// @version      1.1.0
// @description  Българска версия: заменя универсалните тригери Q1-Q10 с готови AI промптове за бързо въвеждане в AI чатове
// @author       1777maxim7771
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){'use strict';
/* Цел: по-бърза работа с ChatGPT, Gemini, Claude, Copilot и други AI чатове. Q1-Q10 са универсални тригери и могат да се сменят със собствени думи или фрази. */
const COMMANDS={
'Q1':`Преведи предоставения текст напълно и точно на български език.
Запази смисъла, реда на информацията, имената, датите, сумите, номерата на документи, имената на организации и важните формулировки.
Не добавяй собствени заключения, не съкращавай текста и не променяй съдържанието.`,
'Q2':`Обобщи предоставения текст на български език според смисъла и контекста.
Обясни за какво е текстът, кой на кого пише, каква е основната тема и какви изисквания, молби, решения, дати, срокове, суми или важни детайли са посочени.`,
'Q3':`Направи кратко тематично резюме на писмото на български език строго в един ред.
Посочи подателя, темата, какво се съобщава или изисква и кои дати, срокове, суми, документи или действия са важни.`,
'Q4':`Преведи предоставения текст на прост и разбираем немски език, ниво A2-B1.
Текстът трябва да бъде учтив, официален и граматически правилен.
Запази първоначалния смисъл, датите, имената, сумите, адресите, организациите и важните детайли.`,
'Q5':`Поправи предоставения български текст.
Направи го граматически правилен, ясен и логичен, като запазиш първоначалния смисъл.
Премахни грешки, повторения, неподходящи формулировки и прекалено разговорни части.
Не добавяй факти, които не присъстват в оригиналния текст.`,
'Q6':`Напиши кратък, учтив и официален отговор на това писмо на български език.
Отговорът трябва да бъде ясен и по същество, без излишни фрази.
Ако трябва да се потвърди получаване, да се уточнят документи, да се поиска обяснение или да се съобщи информация, формулирай го правилно.`,
'Q7':`Обясни на български с прости думи какво означава този текст.
Анализирай контекста: кой пише, по какъв въпрос, какво се иска, какво трябва да се направи и кои срокове, дати, суми, документи или условия са важни.`,
'Q8':`Извлечи всички важни факти от предоставения текст и ги структурирай на български език.
Посочи отделно: хора, организации, адреси, дати, срокове, суми, номера на документи, изисквания, решения, задължения, споменати документи и следващи стъпки.
Не измисляй информация. Ако нещо липсва, напиши: не е посочено.`,
'Q9':`Създай на български ясен списък с действия, които трябва да се изпълнят въз основа на този текст.
Определи какво трябва да се направи, какви документи да се подготвят, на кого да се отговори, къде да се обърне човек, какви срокове да се спазят и на какво да се обърне внимание.
Раздели действията по приоритет: спешно, важно, може по-късно.`,
'Q10':`Състави учтиво официално писмо на немски език въз основа на предоставения текст.
Писмото трябва да бъде просто, ясно и правилно, ниво A2-B1.
Запази всички важни факти: имена, дати, суми, адреси, организации, номера на документи и обстоятелства.
Завърши с: Mit freundlichen Grüßen`};
const S=['textarea','input[type="text"]','input[type="search"]','[contenteditable="true"]','[contenteditable="plaintext-only"]','[role="textbox"]'];
function ie(e){if(!e||!e.matches)return false;if(e.disabled||e.readOnly)return false;const t=e.tagName?e.tagName.toLowerCase():'';const y=(e.getAttribute('type')||'').toLowerCase();if(t==='input'&&!['text','search'].includes(y))return false;return S.some(s=>e.matches(s));}
function fe(t){if(!t)return null;if(ie(t))return t;if(t.closest){const e=t.closest(S.join(','));if(ie(e))return e;}return null;}
function gt(e){const t=e.tagName?e.tagName.toLowerCase():'';return(t==='textarea'||t==='input')?(e.value||''):(e.innerText||e.textContent||'');}
function nc(x){return String(x||'').trim().replace(/\s+/g,'').toUpperCase();}
function end(e){e.focus();const t=e.tagName?e.tagName.toLowerCase():'';if(t==='textarea'||t==='input'){const l=e.value.length;e.setSelectionRange(l,l);return;}const r=document.createRange(),s=window.getSelection();r.selectNodeContents(e);r.collapse(false);s.removeAllRanges();s.addRange(r);}
function ev(e,text){try{e.dispatchEvent(new InputEvent('input',{bubbles:true,cancelable:true,inputType:'insertReplacementText',data:text}));}catch(_){e.dispatchEvent(new Event('input',{bubbles:true}));}e.dispatchEvent(new Event('change',{bubbles:true}));}
function rt(e,text){const t=e.tagName?e.tagName.toLowerCase():'';e.focus();if(t==='textarea'||t==='input'){e.value=text;end(e);ev(e,text);return;}try{const r=document.createRange(),s=window.getSelection();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);document.execCommand('insertText',false,text);}catch(_){e.textContent=text;}end(e);ev(e,text);}
function note(m){const o=document.getElementById('tampermonkey-universal-ai-prompt-commands-notification');if(o)o.remove();const b=document.createElement('div');b.id='tampermonkey-universal-ai-prompt-commands-notification';b.textContent=m;b.style.cssText='position:fixed;right:20px;bottom:20px;z-index:999999;background:#111;color:#fff;padding:12px 18px;border-radius:10px;font:14px Arial,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.35)';document.body.appendChild(b);setTimeout(()=>b.remove(),2200);}
function cr(t){const e=fe(t);if(!e)return;const c=nc(gt(e));if(!Object.prototype.hasOwnProperty.call(COMMANDS,c))return;rt(e,COMMANDS[c]);note(`Тригерът ${c} е заменен с готов AI промпт`);}
document.addEventListener('input',e=>setTimeout(()=>cr(e.target),20),true);document.addEventListener('keyup',e=>setTimeout(()=>cr(e.target),20),true);document.addEventListener('paste',e=>setTimeout(()=>cr(e.target),50),true);
})();