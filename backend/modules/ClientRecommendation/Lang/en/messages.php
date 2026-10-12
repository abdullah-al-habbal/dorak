<?php

declare(strict_types=1);

return [
    'cli_description' => 'Recompute client preference vectors from interaction signals',
    'cli_client_id_option' => 'Recompute a single client by UUID',
    'cli_force_option' => 'Skip freshness check',
    'cli_recomputing_client' => 'Recomputing vector for client: :client_id',
    'cli_recomputing_all_clients' => 'Recomputing vectors for all clients with signals...',
    'cli_done' => 'Done.',
    'cli_embedding_missing' => 'No embedding returned for :entity_type: :entity_id',
    'cli_embedding_computed' => 'Embedding computed for :entity_type: :entity_id',
    'cli_embedding_failed' => 'Failed for :entity_type :entity_id: :reason',
    'cli_client_embedding_missing' => 'No embedding returned for client: :client_id',
    'cli_client_vector_computed' => 'Vector computed for client: :client_id',
    'cli_client_vector_failed' => 'Failed for client :client_id: :reason',
];
