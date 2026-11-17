# MAX PLUS — Landing Page + painel de gestão

Projeto independente do MASTERMAX PLUS. Não altera a VPS nem o painel existente.

## O que está incluído
- Página pública responsiva (celular e computador).
- Planos Mensal R$ 35,00; Trimestral R$ 95,00; Semestral R$ 180,00; Anual R$ 295,00.
- Formulário de teste grátis que encaminha para o WhatsApp 55 11 94080-2230.
- Painel administrativo com login Supabase.
- Upload real de imagens para Supabase Storage, com prévia e remoção.
- Publicação do conteúdo para todos os visitantes via tabela `site_content`.

## 1. Criar recursos no Supabase
Use o projeto Supabase que deseja dedicar ao site (não precisa mexer em Edge Functions nem no MASTERMAX PLUS).

No SQL Editor, execute `supabase-setup.sql`. Isso cria:
- tabela `site_content`
- tabela `admin_users`
- bucket público `maxplus-images`
- políticas RLS para que somente usuários listados em `admin_users` alterem o conteúdo e enviem/removam imagens.

## 2. Criar a conta administradora
No Supabase: Authentication → Users → Add user.
Crie seu e-mail e senha administrativos. Confirme o usuário.
Copie o UUID desse usuário e execute no SQL Editor:

`insert into public.admin_users(user_id) values ('COLE-O-UUID-AQUI');`

Não compartilhe sua senha com ninguém.

## 3. Configurar a conexão
No Supabase: Project Settings → API.
Copie:
- Project URL
- anon/public key (ou publishable key compatível)

Edite `config.js` e substitua os dois textos `COLE_AQUI...`.
**Nunca coloque a chave `service_role` no site.** A chave anon/public é própria para uso no navegador e as políticas RLS protegem os dados.

## 4. Publicar gratuitamente no GitHub Pages
1. Crie um repositório público chamado `max-plus-site` na sua conta GitHub.
2. Envie os arquivos deste pacote para a raiz do repositório: `index.html`, `styles.css`, `config.js`, `app.js` e `supabase-setup.sql` (pode manter também o README).
3. No GitHub, abra Settings → Pages.
4. Em Build and deployment, escolha Deploy from a branch; Branch `main`; folder `/ (root)`; Save.
5. Aguarde o endereço aparecer na mesma tela.

## 5. Primeiro teste
- Abra o endereço público e confira os planos.
- Toque no botão de engrenagem discreto no canto inferior direito.
- Entre com o e-mail e senha criados no Supabase.
- Selecione uma imagem em Escolher imagem. O Android deve abrir o seletor de arquivos.
- Clique em Salvar e publicar.
- Abra a página em outra aba para confirmar que a imagem e o conteúdo aparecem.

## Observações
- A primeira versão traz 8 cards editáveis (3 filmes, 3 séries e 2 jogos). Os dados iniciais são exemplos e devem ser substituídos por conteúdo que você tenha autorização para divulgar.
- O site é uma vitrine e formulário de contato. Não integra nem modifica o sistema de entrega de conteúdo.
- Para trocar o número do WhatsApp, altere `WHATSAPP` em `config.js` ou pelo editor.
- Se publicar em um caminho de subpasta do GitHub Pages, os caminhos relativos já usados no projeto funcionam.
