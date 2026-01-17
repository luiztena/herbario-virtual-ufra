🚀 **Versão 1.0.0 – Primeira versão oficial**

Este repositório contém a primeira versão funcional do Herbário Virtual,
com catálogo de famílias botânicas, sistema de busca inteligente e filtros
interativos.

Este projeto encontra-se em fase de MVP (Produto Mínimo Viável) e será
expandido futuramente para incluir gêneros, espécies e colaboração de
outros pesquisadores.


# herbario-virtual-ufra
Herbário Virtual – sistema de catalogação botânica (famílias, gêneros e espécies)

# 🌿 Herbário Virtual – UFRA

O **Herbário Virtual – UFRA** é uma plataforma educacional e científica voltada para o estudo, organização e divulgação da diversidade vegetal.  
O projeto tem como objetivo funcionar como um **sistema de busca botânica**, permitindo pesquisar **famílias, gêneros e espécies** de forma intuitiva, precisa e escalável.

---

## 🎯 Objetivos do Projeto

- Democratizar o acesso ao conhecimento botânico
- Facilitar pesquisas acadêmicas e educacionais
- Organizar dados taxonômicos de forma estruturada
- Criar uma base escalável para futuras parcerias científicas
- Simular um “**Google botânico**” com foco em taxonomia vegetal

---

## 🧠 Estrutura Conceitual

O projeto foi pensado como um **sistema**, não apenas um site estático.

### Separação clara de responsabilidades:

### 📂 Parte de Dados
- Arquivos **JSON**
- Podem ser atualizados sem alterar a lógica do sistema
- Estrutura hierárquica:
  - Famílias
  - Gêneros (relacionados às famílias)
  - Espécies (relacionadas aos gêneros)

### ⚙️ Parte Lógica
- JavaScript puro (Vanilla JS)
- Controle de busca, autocomplete, sugestões e navegação
- Filtros contextuais (ex: buscar apenas gêneros de uma família específica)

### 🧱 Parte Estrutural
- HTML semântico
- CSS responsivo
- Layouts reutilizáveis e padronizados

---

## 🔍 Funcionalidades Atuais

- Barra de pesquisa inteligente
- Autocomplete com destaque (highlight)
- Busca aproximada (Levenshtein – “Você quis dizer…?”)
- Mensagens para entradas inesperadas
- Filtro por grupos botânicos
- Navegação por cards
- Layout responsivo
- Footer institucional
- Estrutura preparada para crescimento

---

## 🧬 Funcionalidades Planejadas

- Busca unificada por famílias, gêneros e espécies
- Filtro automático por contexto da página
- Geração dinâmica de páginas a partir de JSON
- Catálogos dinâmicos de gêneros e espécies
- Padronização total de layouts
- Melhorias em acessibilidade (WCAG)
- Otimização de performance para grandes volumes de dados

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **JSON**
- **Git & GitHub**

> O projeto foi desenvolvido **sem frameworks**, priorizando controle total, performance e aprendizado profundo das tecnologias base da web.

---

## 📁 Estrutura do Projeto (simplificada)

