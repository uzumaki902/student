(function(){
  const params = new URLSearchParams(location.search);
  // default api root is /api which lets you serve frontend from a static server and proxy to backend
  const apiRoot = params.get('api') || '/api';
  document.getElementById('apiRoot').textContent = apiRoot;

  const tBody = document.querySelector('#studentsTable tbody');
  const rowTpl = document.getElementById('rowTpl');

  async function fetchStudents(){
    const res = await fetch(apiRoot + '/students');
    if(!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  }

  function renderSummary(list){
    const count = list.length;
    const marks = list.map(s => Number(s.Marks)).filter(n => !isNaN(n));
    const avg = marks.length ? (marks.reduce((a,b)=>a+b,0)/marks.length).toFixed(2) : 0;
    const min = marks.length ? Math.min(...marks) : 0;
    const max = marks.length ? Math.max(...marks) : 0;
    document.getElementById('count').textContent = count;
    document.getElementById('avg').textContent = avg;
    document.getElementById('min').textContent = min;
    document.getElementById('max').textContent = max;
  }

  async function loadAndRender(){
    try{
      const list = await fetchStudents();
      tBody.innerHTML = '';
      list.forEach(s => {
        const tr = rowTpl.content.firstElementChild.cloneNode(true);
        tr.querySelector('.id').textContent = s.id;
        tr.querySelector('.number_courses').textContent = s.number_courses;
        tr.querySelector('.time_study').textContent = s.time_study;
        tr.querySelector('.Marks').textContent = s.Marks;

        const actions = tr.querySelector('.actions');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', ()=> openEdit(s));
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', ()=> delStudent(s.id));
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        tBody.appendChild(tr);
      });
      renderSummary(list);
    }catch(e){
      console.error(e);
      alert('Unable to load students: ' + e.message);
    }
  }

  async function delStudent(id){
    if(!confirm('Delete student #' + id + '?')) return;
    const res = await fetch(apiRoot + '/students/' + id, { method: 'DELETE' });
    if(!res.ok) return alert('Delete failed');
    await loadAndRender();
  }

  function openEdit(student){
    // populate form with student data and change submit to update
    document.getElementById('number_courses').value = student.number_courses;
    document.getElementById('time_study').value = student.time_study;
    document.getElementById('Marks').value = student.Marks;
    const addForm = document.getElementById('addForm');
    addForm.dataset.editing = student.id;
    addForm.querySelector('button[type="submit"]').textContent = 'Update Student';
  }

  document.getElementById('addForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const editing = form.dataset.editing;
    const body = {
      number_courses: Number(document.getElementById('number_courses').value),
      time_study: Number(document.getElementById('time_study').value),
      Marks: Number(document.getElementById('Marks').value),
    };
    try{
      if(editing){
        const res = await fetch(apiRoot + '/students/' + editing, {
          method: 'PUT',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(body)
        });
        if(!res.ok) throw new Error('Update failed');
        delete form.dataset.editing;
        form.querySelector('button[type="submit"]').textContent = 'Add Student';
      } else {
        const res = await fetch(apiRoot + '/students', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(body)
        });
        if(!res.ok) throw new Error('Add failed');
      }
      form.reset();
      await loadAndRender();
    }catch(e){
      console.error(e);
      alert(e.message);
    }
  });

  document.getElementById('refreshBtn').addEventListener('click', loadAndRender);

  // initial load
  loadAndRender();
})();
