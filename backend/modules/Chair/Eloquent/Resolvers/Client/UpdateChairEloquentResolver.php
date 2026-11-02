<?php

declare(strict_types=1);

namespace Modules\Chair\Eloquent\Resolvers\Client;

use Modules\Chair\CQRS\Command\Client\UpdateChairCommand;
use Modules\Chair\Models\ChairModel;
use Modules\Chair\Services\ChairStatusService;
use Modules\Chair\ValuesObjects\ChairStatusChangeResult;

final class UpdateChairEloquentResolver
{
    public function __construct(private readonly ChairStatusService $chairStatus) {}

    public function resolve(UpdateChairCommand $command): ChairStatusChangeResult
    {
        $chair = ChairModel::with(['branch', 'barber'])->findOrFail($command->chairId);

        $data = [];

        if ($command->label !== null) {
            $data['label'] = $command->label;
        }

        if ($command->status !== null) {
            $data['status'] = $command->status;
        }

        if ($command->barberIdProvided) {
            $data['barber_id'] = $command->barberId;
        }

        if ($command->floorZone !== null) {
            $data['floor_zone'] = $command->floorZone;
        }

        if ($command->layoutSettings !== null) {
            $data['layout_settings'] = $command->layoutSettings;
        }

        $result = $this->chairStatus->update($chair, $data, $command->force);
        $result->chair->load('branch');

        return $result;
    }
}
