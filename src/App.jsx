const concluirPedido = async (pedidoId) => {
  try {
    // No Supabase, para atualizar por ID via REST, usamos um filtro eq= na URL
    const response = await fetch(`${SUPABASE_PEDIDOS_URL}?id=eq.${pedidoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY, // Verifique se sua variável de chave está correta
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: 'concluido' }) // Certifique-se de que a coluna no banco se chama 'status'
    });

    if (!response.ok) {
      const erroDetalhe = await response.text();
      console.error('Detalhes do erro do Supabase:', erroDetalhe);
      throw new Error('Erro ao atualizar o pedido no banco de dados.');
    }

    // Atualiza o estado local ou recarrega os dados do servidor
    setPedidos((prevPedidos) => prevPedidos.filter(p => p.id !== pedidoId));
    
    // Opcional: Garante que os dados sincronizados do servidor sejam buscados novamente
    if (typeof carregarPedidos === 'function') {
      carregarPedidos();
    }
  } catch (error) {
    console.error('Erro ao concluir pedido:', error);
    alert('Não foi possível salvar a alteração na nuvem.');
  }
};
