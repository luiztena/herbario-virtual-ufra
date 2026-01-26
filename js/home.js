// ================= EFEITO DE HOVER NO TÍTULO MVV =================
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os elementos
    const mvvCards = document.querySelectorAll('.mvv-card');
    const mvvTitle = document.querySelector('.mvv-title');
    
    // Debug: Verifica se os elementos foram encontrados
    console.log('🔍 Verificando elementos MVV:');
    console.log('   Cards encontrados:', mvvCards.length);
    console.log('   Título encontrado:', mvvTitle ? 'Sim' : 'Não');
    
    // Se os elementos existem, adiciona os eventos
    if (mvvCards.length > 0 && mvvTitle) {
        console.log('✅ Eventos de hover sendo configurados...');
        
        mvvCards.forEach((card, index) => {
            // Quando o mouse entra no card
            card.addEventListener('mouseenter', function() {
                console.log(`🖱️ Mouse entrou no card ${index + 1}`);
                mvvTitle.style.color = 'lightgreen';
                mvvTitle.style.filter = 'brightness(1.3)';
            });
            
            // Quando o mouse sai do card
            card.addEventListener('mouseleave', function() {
                console.log(`🖱️ Mouse saiu do card ${index + 1}`);
                mvvTitle.style.color = '#1b5e20';
                mvvTitle.style.filter = 'brightness(1)';
            });
        });
        
        console.log('✅ Eventos configurados com sucesso!');
    } else {
        console.error('❌ ERRO: Elementos não encontrados!');
        console.error('   Verifique se as classes .mvv-card e .mvv-title existem no HTML');
    }
});

// ================= OUTRAS FUNCIONALIDADES (se necessário) =================
// Você pode adicionar mais funcionalidades JavaScript aqui