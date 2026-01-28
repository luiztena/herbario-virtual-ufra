  // Adiciona funcionalidade de zoom na imagem
    document.addEventListener('DOMContentLoaded', function() {
      const treeImage = document.querySelector('.tree-image');
      const treeContainer = document.querySelector('.tree-container');
      
      if (treeImage) {
        // Verifica se a imagem foi carregada
        treeImage.onload = function() {
          console.log('Imagem carregada:', this.naturalWidth, 'x', this.naturalHeight);
          
          // Adiciona botão de zoom se a imagem for grande
          if (this.naturalWidth > 1000) {
            const zoomBtn = document.createElement('button');
            zoomBtn.innerHTML = '<i class="fas fa-search-plus"></i> Visualizar em tela cheia';
            zoomBtn.style.cssText = `
              display: block;
              margin: 20px auto 0;
              padding: 12px 25px;
              background: rgba(46, 125, 50, 0.8);
              color: white;
              border: none;
              border-radius: 50px;
              font-family: "Source Code Pro", monospace;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;
            
            zoomBtn.onmouseover = function() {
              this.style.background = 'rgba(27, 94, 32, 0.9)';
              this.style.transform = 'translateY(-2px)';
            };
            
            zoomBtn.onmouseout = function() {
              this.style.background = 'rgba(46, 125, 50, 0.8)';
              this.style.transform = 'translateY(0)';
            };
            
            zoomBtn.onclick = function() {
              window.open(treeImage.src, '_blank');
            };
            
            treeContainer.appendChild(zoomBtn);
          }
        };
        
        // Se a imagem já estiver carregada (cache)
        if (treeImage.complete) {
          treeImage.onload();
        }
      }
    });