
    const taskInput=document.getElementById('taskInput');
    const dueDate=document.getElementById('dueDate');
    const addBtn=document.getElementById('addBtn');
    const listEl=document.getElementById('list');
    const search=document.getElementById('search');
    const chips=document.querySelectorAll('.chip');
    const clearAll=document.getElementById('clearAll');
    const markAllDone=document.getElementById('markAllDone');
    const counts={total:document.getElementById('countTotal'),active:document.getElementById('countActive'),done:document.getElementById('countDone')};

    const storage={load:()=>JSON.parse(localStorage.getItem('td.tasks')||'[]'),save:(d)=>localStorage.setItem('td.tasks',JSON.stringify(d))};
    let tasks=storage.load(); let filter='all';

    function save(){storage.save(tasks);render();}

    function addTask(text){
      if(!text.trim())return;
      const task={id:Date.now().toString(36),text:text.trim(),done:false,created:new Date().toISOString(),due:dueDate.value||null};
      tasks.unshift(task);
      save(); taskInput.value=''; dueDate.value='';
    }

    function render(){
      const q=search.value.trim().toLowerCase();
      const filtered=tasks.filter(t=>{
        if(filter==='active'&&t.done)return false;
        if(filter==='completed'&&!t.done)return false;
        if(filter==='today'){
          if(!t.due)return false;
          const d=new Date(t.due);const today=new Date();
          return d.toDateString()===today.toDateString();
        }
        if(q&&!t.text.toLowerCase().includes(q))return false;
        return true;
      });
      listEl.innerHTML='';
      if(!filtered.length){
        listEl.innerHTML='<div class="empty fade-in">✨ No tasks yet — Let’s get things done today!</div>';
      }
      filtered.forEach(task=>{
        const el=document.createElement('div'); el.className='task fade-in';
        const check=document.createElement('button'); check.className='check'; check.innerHTML=task.done?'✓':''; if(task.done)check.classList.add('done');
        const leftCol=document.createElement('div'); leftCol.className='left-col';
        const title=document.createElement('div'); title.className='title'; title.textContent=task.text;
        const meta=document.createElement('div'); meta.className='meta';
        let m='Added '+new Date(task.created).toLocaleString();
        if(task.due)m+=' • Due '+new Date(task.due).toLocaleDateString();
        meta.textContent=m;
        leftCol.appendChild(title); leftCol.appendChild(meta);
        const actions=document.createElement('div'); actions.className='actions';
        const editBtn=document.createElement('button'); editBtn.className='btn small ghost'; editBtn.textContent='Edit';
        const delBtn=document.createElement('button'); delBtn.className='btn small'; delBtn.textContent='Delete'; delBtn.style.background='transparent'; delBtn.style.border='1px solid var(--danger)'; delBtn.style.color='var(--danger)';
        actions.appendChild(editBtn); actions.appendChild(delBtn);
        el.appendChild(check); el.appendChild(leftCol); el.appendChild(actions);
        check.addEventListener('click',()=>{task.done=!task.done;save();});
        delBtn.addEventListener('click',()=>{if(confirm('Delete this task?')){tasks=tasks.filter(t=>t.id!==task.id);save();}});
        editBtn.addEventListener('click',()=>startEdit(task,title));
        title.addEventListener('dblclick',()=>startEdit(task,title));
        listEl.appendChild(el);
      });
      counts.total.textContent=tasks.length;
      counts.done.textContent=tasks.filter(t=>t.done).length;
      counts.active.textContent=tasks.filter(t=>!t.done).length;
    }

    function startEdit(task,titleEl){
      const input=document.createElement('input');
      input.value=task.text; input.style.width='100%'; input.style.padding='8px'; input.style.fontSize='14px'; input.style.borderRadius='8px';
      titleEl.replaceWith(input); input.focus(); input.select();
      function finish(){const v=input.value.trim(); if(v){task.text=v; save();}}
      input.addEventListener('blur',finish);
      input.addEventListener('keydown',e=>{if(e.key==='Enter')finish();if(e.key==='Escape')render();});
    }

    addBtn.addEventListener('click',()=>addTask(taskInput.value));
    taskInput.addEventListener('keydown',e=>{if(e.key==='Enter')addTask(taskInput.value)});
    let searchTimer; search.addEventListener('input',()=>{clearTimeout(searchTimer); searchTimer=setTimeout(render,200);});
    chips.forEach(c=>c.addEventListener('click',()=>{chips.forEach(x=>x.classList.remove('active')); c.classList.add('active'); filter=c.dataset.filter; render();}));
    clearAll.addEventListener('click',()=>{if(!tasks.length)return alert('No tasks to clear'); if(confirm('Clear all tasks?')){tasks=[];save();}});
    markAllDone.addEventListener('click',()=>{if(!tasks.length)return; tasks.forEach(t=>t.done=true); save();});
    document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='n'&&document.activeElement.tagName!=='INPUT'){taskInput.focus();e.preventDefault();}});
    render();
