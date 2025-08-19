const $ = (q, c = document) => c.querySelector(q);
const $$ = (q, c = document) => [...c.querySelectorAll(q)];

(function themeInit(){
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const saved = localStorage.getItem('theme');
    if(saved === 'light' || (!saved && prefersLight)){
        document.documentElement.classList.add('light');
    }
})();

$('#themeToggle').addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

const navToggle = $('#navToggle');
const primaryNav = $('#primaryNav');

const closeNav = () => {
    primaryNav.style.display = '';
    navToggle.setAttribute('aria-expanded', 'false');
};

navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if(!expanded){
        primaryNav.style.display = 'grid';
    } else{
        closeNav();
    }
});

$$('#primaryNav a').forEach(a => a.addEventListener('click', closeNav));

const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if(e.isIntersecting){
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    })
}, { 
    threshold: .12
});

$$('.reveal').forEach(el => io.observe(el));

const filterBtns = $$('.filter-btn');
const projectCards = $$('.project');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => { 
            b.classList.remove('active'); 
            b.setAttribute('aria-selected', 'false'); 
        });
        btn.classList.add('active'); 
        btn.setAttribute('aria-selected', 'true');

        const tag = btn.dataset.filter;
        projectCards.forEach(card => {
            const show = tag === 'all' || card.dataset.tags.includes(tag);
            card.classList.toggle('hidden', !show);
        });
    });
});

const form = $('#contactForm');

const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    message: v => v.trim().length >= 10 || 'Message should be at least 10 characters.'
};

function setError(input, msg){
    const err = input.parentElement.querySelector('.error');
    err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

['input','blur'].forEach(evt => {
    form.addEventListener(evt, e => {
        if(!(e.target instanceof HTMLElement)) {
            return;
        }
        const el = e.target;
        if(!('name' in el)) {
            return;
        }
        const name = el.getAttribute('name');
        if(!name || !(name in validators)) {
            return;
        }
        const value = el.value || '';
        const res = validators[name](value);
        setError(el, res === true ? '' : res);
    }, true);
});

form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    for(const [name, validate] of Object.entries(validators)){
        const input = form.elements.namedItem(name);
        const value = input && 'value' in input ? input.value : '';
        const res = validate(String(value));
        if(res !== true){
            setError(input, res);
            ok = false;
        } else {
            setError(input, '');
        }
    }
    if(!ok) {
        return;
    }

    const data = Object.fromEntries(new FormData(form));
    console.log('Form submission:', data);

    form.reset();
    const toast = document.createElement('div');
    toast.textContent = 'Thanks! Your message has been sent.';
    toast.style.cssText = `
        position: fixed; 
        left: 50%; 
        bottom: 24px; 
        transform: translateX(-50%);
        padding: 12px 16px; 
        border-radius: 12px; 
        border:1px solid rgba(255,255,255,.15);
        background: linear-gradient(135deg, rgba(124,58,237,.85), rgba(34,211,238,.85));
        color: #fff;
        font-weight: 700; 
        box-shadow: 0 10px 30px rgba(2,6,23,.35); z-index: 1000;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
});

$('#year').textContent = new Date().getFullYear();