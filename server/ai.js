const providers = {
  gemini: { url: (model)=>`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=`, model:'gemini-2.0-flash' },
  groq: { url: ()=> 'https://api.groq.com/openai/v1/chat/completions', model:'llama-3.3-70b-versatile' },
  openai: { url: ()=> 'https://api.openai.com/v1/chat/completions', model:'gpt-4o-mini' }
};
export async function streamAI({provider,key,messages,systemPrompt,onChunk,signal}) {
  if(!key) throw new Error(`Add a ${provider.toUpperCase()} API key in Settings, or configure it in the server .env file.`);
  const p=providers[provider]||providers.gemini;
  if(provider==='gemini') {
    const contents=messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
    const body={contents,generationConfig:{temperature:0.7,topP:0.95,maxOutputTokens:4096}};
    if(systemPrompt) body.systemInstruction={parts:[{text:systemPrompt}]};
    const res=await fetch(p.url(p.model)+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
    if(!res.ok) throw new Error(`Gemini API error (${res.status}): ${await res.text()}`);
    const reader=res.body.getReader(), decoder=new TextDecoder(); let buffer='';
    while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split('\n');buffer=lines.pop()||'';for(const line of lines){if(!line.startsWith('data:'))continue;const raw=line.slice(5).trim();if(!raw||raw==='[DONE]')continue;try{const obj=JSON.parse(raw);const text=obj.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('')||'';if(text)onChunk(text);}catch{}}}
    return;
  }
  const payload={model:p.model,stream:true,messages:[...(systemPrompt?[{role:'system',content:systemPrompt}]:[]),...messages.map(({role,content})=>({role,content}))]};
  const res=await fetch(p.url(),{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify(payload),signal});
  if(!res.ok) throw new Error(`${provider.toUpperCase()} API error (${res.status}): ${await res.text()}`);
  const reader=res.body.getReader(),decoder=new TextDecoder();let buffer='';
  while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split('\n');buffer=lines.pop()||'';for(const line of lines){if(!line.startsWith('data:'))continue;const raw=line.slice(5).trim();if(!raw||raw==='[DONE]')continue;try{const obj=JSON.parse(raw);const text=obj.choices?.[0]?.delta?.content;if(text)onChunk(text);}catch{}}}
}
