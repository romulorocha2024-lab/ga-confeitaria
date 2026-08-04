const concluirPedido = async (pedidoId) => {
  try {
    // 1. Faz a requisição para atualizar o status no Supabase
    const response = await fetch(`${SUPABASE_PEDIDOS_URL}/${pedidoId}`, {
      method: 'PATCH', // ou 'PUT', dependendo de como sua API está configurada
      headers: headersSupabase,
      body: JSON.stringify({ status: 'concluido' }) // ou o campo que define o status no seu banco
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar o pedido no banco de dados.');
    }

    // 2. Só atualiza o estado local após o sucesso no servidor
    setPedidos(pedidos.filter(p => p.id !== pedidoId));
    
    // Opcional: Recarregar a lista de pedidos do servidor
    carregarPedidos();
  } catch (error) {
    console.error('Erro ao concluir pedido:', error);
    alert('Não foi possível salvar a alteração na nuvem.');
  }
};
