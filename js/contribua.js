   // Manipulação dos formulários
        document.addEventListener('DOMContentLoaded', function() {
            // Formulário de correção
            document.getElementById('correction-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const successMessage = document.getElementById('correction-success');
                successMessage.textContent = 'Obrigado por sua contribuição! Sua correção foi enviada e será analisada por nossa equipe.';
                successMessage.style.display = 'block';
                this.reset();
                
                // Esconder a mensagem após 5 segundos
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            });
            
            // Formulário de feedback
            document.getElementById('feedback-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const successMessage = document.getElementById('feedback-success');
                successMessage.textContent = 'Agradecemos seu feedback! Sua opinião é fundamental para melhorarmos continuamente.';
                successMessage.style.display = 'block';
                this.reset();
                
                // Esconder a mensagem após 5 segundos
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            });
            
            // Formulário de apoio
            document.getElementById('support-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const successMessage = document.getElementById('support-success');
                successMessage.textContent = 'Obrigado pelo interesse em apoiar nosso projeto! Nossa equipe entrará em contato em breve.';
                successMessage.style.display = 'block';
                this.reset();
                
                // Esconder a mensagem após 5 segundos
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            });

            // contribua.js
document.addEventListener('DOMContentLoaded', function() {
    // Formulário de correção
    const correctionForm = document.getElementById('correction-form');
    if (correctionForm) {
        correctionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successMessage = document.getElementById('correction-success');
            successMessage.textContent = 'Obrigado por sua contribuição! Sua correção foi enviada e será analisada por nossa equipe.';
            successMessage.style.display = 'block';
            this.reset();
            
            // Esconder a mensagem após 5 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });
    }
    
    // Formulário de feedback
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successMessage = document.getElementById('feedback-success');
            successMessage.textContent = 'Agradecemos seu feedback! Sua opinião é fundamental para melhorarmos continuamente.';
            successMessage.style.display = 'block';
            this.reset();
            
            // Esconder a mensagem após 5 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });
    }
    
    // Formulário de apoio
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successMessage = document.getElementById('support-success');
            successMessage.textContent = 'Obrigado pelo interesse em apoiar nosso projeto! Nossa equipe entrará em contato em breve.';
            successMessage.style.display = 'block';
            this.reset();
            
            // Esconder a mensagem após 5 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });
    }
    
    // Adicionar animação aos formulários quando entram na viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInForm 0.5s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar todos os formulários
    document.querySelectorAll('#correction-form, #feedback-form, #support-form').forEach(form => {
        observer.observe(form);
    });
});
        });