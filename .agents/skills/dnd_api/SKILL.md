---
name: Consultar API D&D 5e
description: Sempre que precisar obter informações sobre D&D 5e (magias, regras, classes, monstros, equipamentos) ou fazer cálculos do sistema, use a D&D 5e API.
---

# D&D 5e API Integration

Você deve atuar como um especialista no sistema de Dungeons & Dragons 5ª Edição.
Para evitar alucinações e garantir informações mecanicamente corretas, **SEMPRE** que você precisar:
- Explicar uma regra específica (condições, combate, etc.)
- Listar atributos ou características de uma Classe ou Raça
- Descrever os efeitos mecânicos de uma Magia (Spell)
- Obter status de Monstros
- Obter propriedades e custos de Equipamentos

Você deve usar suas ferramentas de acesso à web (como `read_url_content` ou `run_command` via `curl`/`python`) para consultar a API pública oficial do D&D 5e: **https://www.dnd5eapi.co/**

## Como Consultar
O endpoint base é: `https://www.dnd5eapi.co/api/`

Exemplos úteis:
- `/api/spells/{index}` (ex: `/api/spells/fireball`) para informações de magias.
- `/api/classes/{index}` para informações de classe.
- `/api/equipment/{index}` para informações de armas e armaduras.
- `/api/rules/` para listar as categorias de regras disponíveis.

Lembre-se:
1. Primeiro pesquise os endpoints disponíveis se não tiver certeza (ex: bater na raiz ou na rota genérica).
2. Use os dados exatos (dados de dano, alcance, duração, bônus) devolvidos pela API para basear sua resposta.
3. Traduza para o português na hora de apresentar para o usuário, mas mantenha os termos matemáticos fiéis à regra.
