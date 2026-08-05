import React, { useState, useEffect } from 'react';
import './App.css';

const SUPABASE_URL = 'https://cnogvsqpmeowrdidweve.supabase.co/rest/v1/PRODUCTS';
const SUPABASE_PEDIDOS_URL = 'https://cnogvsqpmeowrdidweve.supabase.co/rest/v1/ORDERS';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNub2d2c3FwbWVvd3JkaWR3ZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTA3NjQsImV4cCI6MjEwMTMyNjc2NH0.hh3Ot3M6_j274Wr-RcIO5FmR0_Lbg4WCrI611L6UWqk';

const headersSupabase = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export default function App() {
  // Inserção da fonte Recoleta via Google Fonts no Head dinamicamente
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Recoleta:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const ehAdmin = urlParams.get('admin') === 'geicy';

  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregarProdutos();
    carregarPedidos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const resposta = await fetch(`${SUPABASE_URL}?select=*`, {
        headers: headersSupabase
      });
      const data = await resposta.json();
      if (Array.isArray(data)) {
        const produtosFormatados = data.map((p, index) => ({
          id: p.id || index + 1,
          nome: p.name,
          preco: Number(p.price),
          categoria: p.category,
          imagem: p.image || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80'
        }));
        setProdutos(produtosFormatados);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const carregarPedidos = async () => {
    try {
      const resposta = await fetch(`${SUPABASE_PEDIDOS_URL}?select=*&order=created_at.desc`, {
        headers: headersSupabase
      });
      const data = await resposta.json();
      if (Array.isArray(data)) {
        setPedidos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    }
  };

  const concluirPedido = async (pedido) => {
    const campoFiltro = pedido.id !== undefined && pedido.id !== null ? 'id' : 'created_at';
    const valorFiltro = pedido.id !== undefined && pedido.id !== null ? pedido.id : pedido.created_at;

    if (!valorFiltro) {
      alert('Não foi possível identificar este pedido para conclusão.');
      return;
    }

    try {
      const res = await fetch(`${SUPABASE_PEDIDOS_URL}?${campoFiltro}=eq.${encodeURIComponent(valorFiltro)}`, {
        method: 'PATCH',
        headers: headersSupabase,
        body: JSON.stringify({ status: 'concluido' })
      });

      if (res.ok) {
        await carregarPedidos();
      } else {
        const erroTxt = await res.text();
        console.error('Erro ao concluir:', erroTxt);
        alert('Não foi possível concluir o pedido. Verifique o console.');
      }
    } catch (err) {
      console.error('Erro ao concluir pedido:', err);
    }
  };

  const limparTodosPedidos = async () => {
    if (window.confirm('Tem certeza absoluta que deseja apagar TODOS os pedidos do histórico? Essa ação não pode ser desfeita!')) {
      try {
        const res = await fetch(`${SUPABASE_PEDIDOS_URL}?id=gte.0`, {
          method: 'DELETE',
          headers: headersSupabase
        });

        if (res.ok) {
          setPedidos([]);
          alert('Todos os pedidos foram apagados com sucesso!');
        } else {
          const resFallback = await fetch(`${SUPABASE_PEDIDOS_URL}?created_at=not.is.null`, {
            method: 'DELETE',
            headers: headersSupabase
          });
          if (resFallback.ok) {
            setPedidos([]);
            alert('Todos os pedidos foram apagados com sucesso!');
          } else {
            alert('Erro ao apagar os pedidos. Verifique as permissões no Supabase.');
          }
        }
      } catch (err) {
        console.error('Erro ao limpar pedidos:', err);
        alert('Erro de conexão ao tentar limpar os pedidos.');
      }
    }
  };

  const [telaAtual, setTelaAtual] = useState('home');
  const [editandoId, setEditandoId] = useState(null);
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');
  const [categoriaProduto, setCategoriaProduto] = useState('Doces');
  const [imagemProduto, setImagemProduto] = useState('');

  const [carrinhoCliente, setCarrinhoCliente] = useState([]);
  const [nomeClienteWeb, setNomeClienteWeb] = useState('');
  const [telClienteWeb, setTelClienteWeb] = useState('');
  const [endClienteWeb, setEndClienteWeb] = useState('');
  
  const [bairroSelecionado, setBairroSelecionado] = useState('Bairros Próximos (R$ 3,00)');

  const taxasEntrega = {
    'Bairros Próximos (R$ 3,00)': 3.00,
    'Outros Bairros (Campo Novo, Matriz e similares) (R$ 4,00)': 4.00,
    'Frei Serafim, Vila Zizi, Santa Eulália e Ibacazinho (R$ 5,00)': 5.00,
    'Retirada no Local (Grátis)': 0.00
  };

  const [pagamentoWeb, setPagamentoWeb] = useState('Pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [obsClienteWeb, setObsClienteWeb] = useState('');
  const [filtroCategoriaWeb, setFiltroCategoriaWeb] = useState('Todos');

  const lidarComArquivoImagem = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = (eventoLeitura) => {
        setImagemProduto(eventoLeitura.target.result);
      };
      leitor.readAsDataURL(arquivo);
    }
  };

  const salvarProdutoCatalogo = async (e) => {
    e.preventDefault();
    if (!nomeProduto || !precoProduto) {
      alert('Preencha o nome e o preço!');
      return;
    }

    const novaImg = imagemProduto || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80';
    const dadosProd = { 
      name: nomeProduto.trim(), 
      price: parseFloat(precoProduto), 
      category: categoriaProduto, 
      image: novaImg 
    };

    try {
      if (editandoId) {
        await fetch(`${SUPABASE_URL}?name=eq.${encodeURIComponent(editandoId)}`, {
          method: 'PATCH',
          headers: headersSupabase,
          body: JSON.stringify(dadosProd)
        });
        setEditandoId(null);
      } else {
        const res = await fetch(SUPABASE_URL, {
          method: 'POST',
          headers: { ...headersSupabase, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(dadosProd)
        });
        if (!res.ok) {
          const erroText = await res.text();
          console.error('Erro do Supabase:', erroText);
          alert('Erro ao salvar no banco. Verifique o console.');
          return;
        }
      }

      setNomeProduto('');
      setPrecoProduto('');
      setCategoriaProduto('Doces');
      setImagemProduto('');
      carregarProdutos();
      alert('Produto salvo com sucesso!');
    } catch (err) {
      console.error('Erro na requisição:', err);
      alert('Erro de conexão ao salvar produto.');
    }
  };

  const iniciarEdicaoProduto = (prod) => {
    setEditandoId(prod.nome);
    setNomeProduto(prod.nome);
    setPrecoProduto(prod.preco);
    setCategoriaProduto(prod.categoria || 'Doces');
    setImagemProduto(prod.imagem);
  };

  const excluirProduto = async (nomeProd) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await fetch(`${SUPABASE_URL}?name=eq.${encodeURIComponent(nomeProd)}`, {
        method: 'DELETE',
        headers: headersSupabase
      });
      carregarProdutos();
    }
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNomeProduto('');
    setPrecoProduto('');
    setCategoriaProduto('Doces');
    setImagemProduto('');
  };

  const adicionarAoCarrinhoWeb = (produto) => setCarrinhoCliente([...carrinhoCliente, produto]);
  const removerDoCarrinhoWeb = (index) => setCarrinhoCliente(carrinhoCliente.filter((_, i) => i !== index));
  const calcularSubtotalWeb = () => carrinhoCliente.reduce((total, item) => total + item.preco, 0);
  const calcularTaxa = () => taxasEntrega[bairroSelecionado] || 0;
  const calcularTotalGeralWeb = () => calcularSubtotalWeb() + calcularTaxa();

  const enviarPedidoWhatsApp = async (e) => {
    e.preventDefault();
    if (!nomeClienteWeb || carrinhoCliente.length === 0) {
      alert('Preencha seu nome e escolha pelo menos um produto!');
      return;
    }

    const itensTexto = carrinhoCliente.map(i => `• ${i.nome} (R$ ${i.preco.toFixed(2)})`).join('\n');
    const subtotal = calcularSubtotalWeb().toFixed(2);
    const taxa = calcularTaxa().toFixed(2);
    const total = calcularTotalGeralWeb().toFixed(2);

    let infoPagamento = pagamentoWeb;
    if (pagamentoWeb === 'Dinheiro' && trocoPara) infoPagamento += ` (Troco para R$ ${trocoPara})`;

    const novoPedidoData = {
      cliente: nomeClienteWeb,
      telefone: telClienteWeb,
      itens: carrinhoCliente.map(i => i.nome).join(', '),
      status: 'novos',
      entrega: endClienteWeb + ` (${bairroSelecionado})`,
      valor: parseFloat(total),
      pagamento: infoPagamento,
      obs: obsClienteWeb
    };

    try {
      await fetch(SUPABASE_PEDIDOS_URL, {
        method: 'POST',
        headers: headersSupabase,
        body: JSON.stringify(novoPedidoData)
      });
      carregarPedidos();
    } catch (err) {
      console.error('Erro ao salvar pedido no banco:', err);
    }

    const mensagem = `Olá, Geicy! Gostaria de fazer o seguinte pedido:\n\n` +
      `*Cliente:* ${nomeClienteWeb}\n` +
      `*Telefone:* ${telClienteWeb}\n` +
      `*Endereço:* ${endClienteWeb} - ${bairroSelecionado}\n\n` +
      `*Itens do Pedido:*\n${itensTexto}\n\n` +
      `*Subtotal:* R$ ${subtotal}\n` +
      `*Taxa de Entrega:* R$ ${taxa}\n` +
      `*Total a pagar:* R$ ${total}\n` +
      `*Forma de Pagamento:* ${infoPagamento}\n` +
      `*Observações:* ${obsClienteWeb || 'Nenhuma'}`;

    const numeroWhatsApp = '5598988832656';

    window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const produtosFiltradosWeb = filtroCategoriaWeb === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria && p.categoria.toLowerCase().trim() === filtroCategoriaWeb.toLowerCase().trim());

  const totalVendidoGeral = pedidos.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const pedidosCozinhaAtivos = pedidos.filter(p => !p.status || p.status !== 'concluido');

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#fdf2f4', minHeight: '100vh', padding: '20px', color: '#333' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {ehAdmin ? (
          <>
            <header style={{ background: 'white', padding: '30px 20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontFamily: '"Recoleta", serif', color: '#d63384', fontSize: '46px', fontWeight: 'normal', margin: '0 0 10px 0', lineHeight: '1.2' }}>
                🍰 Geicy Aires Confeitaria
              </h1>
              <p style={{ margin: 0, color: '#666', fontWeight: '600', fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Painel de Controle na Nuvem
              </p>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '18px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setTelaAtual('home')} style={{ padding: '8px 12px', backgroundColor: telaAtual === 'home' ? '#d63384' : '#e9ecef', color: telaAtual === 'home' ? 'white' : '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🏠 Início</button>
                <button type="button" onClick={() => setTelaAtual('produtos')} style={{ padding: '8px 12px', backgroundColor: telaAtual === 'produtos' ? '#6f42c1' : '#e9ecef', color: telaAtual === 'produtos' ? 'white' : '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📋 Produtos</button>
                <button type="button" onClick={() => setTelaAtual('cozinha')} style={{ padding: '8px 12px', backgroundColor: telaAtual === 'cozinha' ? '#fd7e14' : '#e9ecef', color: telaAtual === 'cozinha' ? 'white' : '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🍳 Cozinha</button>
                <button type="button" onClick={() => setTelaAtual('financeiro')} style={{ padding: '8px 12px', backgroundColor: telaAtual === 'financeiro' ? '#198754' : '#e9ecef', color: telaAtual === 'financeiro' ? 'white' : '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💰 Financeiro</button>
              </div>
            </header>

            {telaAtual === 'home' && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#d63384' }}>📊 Bem-vinda, Geicy!</h3>
                <p style={{ color: '#666' }}>Seu sistema está sincronizado com o banco de dados.</p>
              </div>
            )}

            {telaAtual === 'produtos' && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#6f42c1', marginTop: 0 }}>📋 Gerenciar Produtos</h2>
                
                <form onSubmit={salvarProdutoCatalogo} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: editandoId ? '#fd7e14' : '#6f42c1' }}>
                    {editandoId ? '✏️ Editando Produto' : '➕ Adicionar Novo Produto'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" value={nomeProduto} onChange={(e) => setNomeProduto(e.target.value)} placeholder="Nome do Doce/Salgado" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="number" step="0.01" value={precoProduto} onChange={(e) => setPrecoProduto(e.target.value)} placeholder="Preço (R$)" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    
                    <select value={categoriaProduto} onChange={(e) => setCategoriaProduto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="Doces">Doces</option>
                      <option value="Bolos">Bolos</option>
                      <option value="Salgados">Salgados</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>

                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555', marginTop: '4px' }}>📸 Foto do produto (Opcional):</label>
                    <input type="file" accept="image/*" onChange={lidarComArquivoImagem} style={{ padding: '6px', background: 'white', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }} />

                    {imagemProduto && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Prévia:</span>
                        <img src={imagemProduto} alt="Prévia" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <button type="submit" style={{ flex: 1, backgroundColor: editandoId ? '#fd7e14' : '#6f42c1', color: 'white', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
                        {editandoId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                      </button>
                      {editandoId && (
                        <button type="button" onClick={cancelarEdicao} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                      )}
                    </div>
                  </div>
                </form>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {produtos.map((prod, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', background: '#fdf2f4', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #d63384' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={prod.imagem} alt={prod.nome} style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <strong>{prod.nome}</strong> <span style={{ fontSize: '11px', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>{prod.categoria}</span>
                          <div style={{ color: '#d63384', fontWeight: 'bold' }}>R$ {prod.preco.toFixed(2)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button type="button" onClick={() => iniciarEdicaoProduto(prod)} style={{ background: '#ffc107', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                        <button type="button" onClick={() => excluirProduto(prod.nome)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {telaAtual === 'cozinha' && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h2 style={{ color: '#fd7e14', margin: 0 }}>🍳 Cozinha - Controle de Pedidos</h2>
                  <button type="button" onClick={carregarPedidos} style={{ background: '#e9ecef', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔄 Atualizar</button>
                </div>
                {pedidosCozinhaAtivos.length === 0 ? <p style={{ color: '#888' }}>Nenhum pedido pendente na cozinha no momento. 🎉</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pedidosCozinhaAtivos.map((ped, index) => (
                      <div key={ped.id || index} style={{ background: '#fff9db', border: '1px solid #ffe066', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '16px' }}>{ped.cliente}</strong>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: ped.status === 'novos' ? '#ff922b' : '#51cf66', color: 'white' }}>{ped.status ? ped.status.toUpperCase() : 'NOVO'}</span>
                        </div>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Itens:</strong> {ped.itens}</p>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Endereço:</strong> {ped.entrega}</p>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Pagamento:</strong> {ped.pagamento} | <strong>Valor:</strong> R$ {Number(ped.valor || 0).toFixed(2)}</p>
                        {ped.obs && <p style={{ margin: '4px 0', fontSize: '13px', color: '#c92a2a' }}><strong>Obs:</strong> {ped.obs}</p>}
                        
                        <button 
                          type="button" 
                          onClick={() => concluirPedido(ped)}
                          style={{ marginTop: '12px', width: '100%', backgroundColor: '#198754', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                        >
                          ✅ Concluir Pedido
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {telaAtual === 'financeiro' && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ color: '#198754', margin: 0 }}>💰 Controle Financeiro</h2>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + ["ID,Cliente,Telefone,Itens,Valor,Pagamento,Data"].join(",") + "\n"
                          + pedidos.map(p => `${p.id},"${p.cliente}","${p.telefone}","${p.itens}",${p.valor},"${p.pagamento}","${p.created_at || ''}"`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `backup_pedidos_${new Date().toISOString().slice(0,10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{ background: '#198754', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      📥 Baixar Backup (CSV)
                    </button>

                    <button 
                      type="button"
                      onClick={limparTodosPedidos}
                      style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🗑️ Limpar Pedidos
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '25px' }}>
                  <div style={{ background: '#d1e7dd', color: '#0f5132', padding: '15px', borderRadius: '8px', border: '1px solid #badbcc' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>Faturamento Total</p>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>R$ {totalVendidoGeral.toFixed(2)}</div>
                  </div>
                  <div style={{ background: '#cff4fc', color: '#055160', padding: '15px', borderRadius: '8px', border: '1px solid #b6effb' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>Total de Pedidos</p>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{pedidos.length}</div>
                  </div>
                  <div style={{ background: '#f8d7da', color: '#842029', padding: '15px', borderRadius: '8px', border: '1px solid #f5c2c7' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>Ticket Médio</p>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                      R$ {pedidos.length > 0 ? (totalVendidoGeral / pedidos.length).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>📅 Faturamento Diário</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e9ecef', color: '#666', fontSize: '13px' }}>
                        <th style={{ padding: '10px' }}>Data</th>
                        <th style={{ padding: '10px' }}>Qtd. Pedidos</th>
                        <th style={{ padding: '10px' }}>Valor Arrecadado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        pedidos.reduce((acc, p) => {
                          const data = p.created_at ? p.created_at.slice(0, 10).split('-').reverse().join('/') : 'Hoje';
                          if (!acc[data]) acc[data] = { qtd: 0, total: 0 };
                          acc[data].qtd += 1;
                          acc[data].total += Number(p.valor || 0);
                          return acc;
                        }, {})
                      ).map(([data, info], index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f3f5', fontSize: '14px' }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{data}</td>
                          <td style={{ padding: '10px', color: '#666' }}>{info.qtd} pedido(s)</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#198754' }}>R$ {info.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      {pedidos.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Nenhum pedido registrado ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* VISÃO DO CLIENTE */
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #e9ecef', paddingBottom: '15px' }}>
              <h2 style={{ fontFamily: '"Recoleta", serif', color: '#d63384', fontSize: '42px', fontWeight: 'normal', margin: '0 0 5px 0', lineHeight: '1.2' }}>
                🍰 Geicy Aires Confeitaria
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: '15px', fontWeight: '600' }}>Escolha suas guloseimas favoritas!</p>
            </div>

            <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>1️⃣ Escolha a Categoria:</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['Todos', 'Doces', 'Bolos', 'Salgados', 'Bebidas'].map(cat => (
                <button key={cat} type="button" onClick={() => setFiltroCategoriaWeb(cat)} style={{ padding: '6px 12px', background: filtroCategoriaWeb === cat ? '#d63384' : '#e9ecef', color: filtroCategoriaWeb === cat ? 'white' : '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{cat}</button>
              ))}
            </div>

            <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>2️⃣ Cardápio:</h3>
            {produtosFiltradosWeb.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '20px' }}>Nenhum produto cadastrado nesta categoria ainda.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                {produtosFiltradosWeb.map((prod, index) => (
                  <div key={index} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <img src={prod.imagem} alt={prod.nome} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                      <div>
                        <strong style={{ fontSize: '14px' }}>{prod.nome}</strong>
                        <div style={{ color: '#d63384', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>R$ {prod.preco.toFixed(2)}</div>
                      </div>
                      <button type="button" onClick={() => adicionarAoCarrinhoWeb(prod)} style={{ marginTop: '10px', background: '#d63384', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>+ Adicionar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={enviarPedidoWhatsApp}>
              <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>3️⃣ Seu Carrinho:</h3>
              <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffc107' }}>
                {carrinhoCliente.length === 0 ? <p style={{ color: '#856404', margin: 0, fontSize: '13px' }}>Nenhum produto escolhido ainda.</p> : (
                  <div>
                    {carrinhoCliente.map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '14px' }}>
                        <span>{item.nome} (R$ {item.preco.toFixed(2)})</span>
                        <button type="button" onClick={() => removerDoCarrinhoWeb(index)} style={{ background: '#dc3540', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>X</button>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #ffeeba', marginTop: '8px', paddingTop: '8px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span> <span>R$ {calcularSubtotalWeb().toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Taxa de Entrega:</span> <span>R$ {calcularTaxa().toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '4px', fontSize: '16px', color: '#856404' }}>
                        <span>Total Geral:</span> <span>R$ {calcularTotalGeralWeb().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>4️⃣ Dados de Entrega e Pagamento:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <input type="text" value={nomeClienteWeb} onChange={(e) => setNomeClienteWeb(e.target.value)} placeholder="Seu Nome Completo *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input type="text" value={telClienteWeb} onChange={(e) => setTelClienteWeb(e.target.value)} placeholder="Seu WhatsApp *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input type="text" value={endClienteWeb} onChange={(e) => setEndClienteWeb(e.target.value)} placeholder="Seu Endereço (Rua e Número) *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Bairro / Taxa de Entrega:</label>
                <select value={bairroSelecionado} onChange={(e) => setBairroSelecionado(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  {Object.keys(taxasEntrega).map(bairro => <option key={bairro} value={bairro}>{bairro}</option>)}
                </select>

                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Forma de Pagamento:</label>
                <select value={pagamentoWeb} onChange={(e) => setPagamentoWeb(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>

                {pagamentoWeb === 'Dinheiro' && (
                  <input type="text" value={trocoPara} onChange={(e) => setTrocoPara(e.target.value)} placeholder="Precisa de troco para quanto? (Ex: 50.00)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                )}

                <textarea value={obsClienteWeb} onChange={(e) => setObsClienteWeb(e.target.value)} placeholder="Observações do pedido..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', height: '60px' }}></textarea>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#25D366', color: 'white', border: 'none', padding: '14px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 211, 102, 0.2)' }}>
                📲 Enviar Pedido via WhatsApp
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
