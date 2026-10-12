<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Services;

use Laravel\Ai\Files\StoredImage;
use Modules\ClientFaceProfile\Ai\FaceShapeAnalyzerAgent;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\ClientFaceProfile\ValuesObjects\FaceAnalysisOutcomeValueObject;
use RuntimeException;

final class FaceAnalysisService
{
    public function __construct(
        private readonly FaceShapeAnalyzerAgent $agent,
        private readonly FaceAnalysisResponseParser $parser,
    ) {}

    public function analyze(ClientFaceProfileModel $profile): FaceAnalysisOutcomeValueObject
    {
        if ($profile->image_path === null) {
            throw new RuntimeException('Face profile has no private image path.');
        }

        $response = $this->agent->prompt(
            prompt: 'Analyze the client face photo attached to this request and return your findings as JSON.',
            attachments: [new StoredImage($profile->image_path, 'local')],
        );

        return $this->parser->parse($response->text);
    }
}
