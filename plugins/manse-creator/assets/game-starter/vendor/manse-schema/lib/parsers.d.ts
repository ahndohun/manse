import { type Catalog, type CatalogSnapshot } from "./catalog.js";
import { type EpisodePack } from "./episode.js";
import { type ManseGameManifest } from "./manifest.js";
import { type PlayerProfile, type SessionStats } from "./profile.js";
import { type PackProvenance } from "./provenance.js";
export declare function parseGameManifest(input: unknown): ManseGameManifest;
export declare function safeParseGameManifest(input: unknown): import("zod").SafeParseReturnType<{
    creator: string;
    sourceUrl: string;
    id: string;
    license: {
        spdxId: string;
        name: string;
        url: string | null;
        attribution: string | null;
    };
    schemaVersion: 1;
    slug: string;
    title: {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
    }[];
    summary: {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
    }[];
    energy: "gentle" | "moderate" | "active";
    gameUrl: string;
    engineVersion: string;
    locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
    ageRange: {
        min: number;
        max: number;
    };
    movementTags: ("balance" | "touch" | "jumping" | "squatting" | "freezing" | "running-in-place" | "seated" | "full-body")[];
    accessibility: {
        captions: boolean;
        seatedMode: boolean;
        highContrast: boolean;
        reducedStimulation: boolean;
        audioCues: boolean;
    };
    thumbnail: {
        url: string;
        mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
        alt: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
    };
    contentProvenance: {
        hasGeneratedAssets: boolean;
        hasThirdPartyAssets: boolean;
        provenanceUrl: string;
    };
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
}, {
    creator: string;
    sourceUrl: string;
    id: string;
    license: {
        spdxId: string;
        name: string;
        url: string | null;
        attribution: string | null;
    };
    schemaVersion: 1;
    slug: string;
    title: {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
    }[];
    summary: {
        locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
        text: string;
    }[];
    energy: "gentle" | "moderate" | "active";
    gameUrl: string;
    engineVersion: string;
    locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
    ageRange: {
        min: number;
        max: number;
    };
    movementTags: ("balance" | "touch" | "jumping" | "squatting" | "freezing" | "running-in-place" | "seated" | "full-body")[];
    accessibility: {
        captions: boolean;
        seatedMode: boolean;
        highContrast: boolean;
        reducedStimulation: boolean;
        audioCues: boolean;
    };
    thumbnail: {
        url: string;
        mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
        alt: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
    };
    contentProvenance: {
        hasGeneratedAssets: boolean;
        hasThirdPartyAssets: boolean;
        provenanceUrl: string;
    };
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
}>;
export declare function parseCatalog(input: unknown): Catalog;
export declare function safeParseCatalog(input: unknown): import("zod").SafeParseReturnType<{
    schemaVersion: 1;
    games: {
        manifestUrl: string;
    }[];
}, {
    schemaVersion: 1;
    games: {
        manifestUrl: string;
    }[];
}>;
export declare function parseCatalogSnapshot(input: unknown): CatalogSnapshot;
export declare function safeParseCatalogSnapshot(input: unknown): import("zod").SafeParseReturnType<{
    schemaVersion: 1;
    games: {
        manifestUrl: string;
        manifest: {
            creator: string;
            sourceUrl: string;
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            schemaVersion: 1;
            slug: string;
            title: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            summary: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            energy: "gentle" | "moderate" | "active";
            gameUrl: string;
            engineVersion: string;
            locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
            ageRange: {
                min: number;
                max: number;
            };
            movementTags: ("balance" | "touch" | "jumping" | "squatting" | "freezing" | "running-in-place" | "seated" | "full-body")[];
            accessibility: {
                captions: boolean;
                seatedMode: boolean;
                highContrast: boolean;
                reducedStimulation: boolean;
                audioCues: boolean;
            };
            thumbnail: {
                url: string;
                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
                alt: {
                    locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                    text: string;
                }[];
            };
            contentProvenance: {
                hasGeneratedAssets: boolean;
                hasThirdPartyAssets: boolean;
                provenanceUrl: string;
            };
            permissions: {
                camera: boolean;
                deviceLocalStorage: boolean;
            };
        };
    }[];
}, {
    schemaVersion: 1;
    games: {
        manifestUrl: string;
        manifest: {
            creator: string;
            sourceUrl: string;
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            schemaVersion: 1;
            slug: string;
            title: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            summary: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            energy: "gentle" | "moderate" | "active";
            gameUrl: string;
            engineVersion: string;
            locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
            ageRange: {
                min: number;
                max: number;
            };
            movementTags: ("balance" | "touch" | "jumping" | "squatting" | "freezing" | "running-in-place" | "seated" | "full-body")[];
            accessibility: {
                captions: boolean;
                seatedMode: boolean;
                highContrast: boolean;
                reducedStimulation: boolean;
                audioCues: boolean;
            };
            thumbnail: {
                url: string;
                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
                alt: {
                    locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                    text: string;
                }[];
            };
            contentProvenance: {
                hasGeneratedAssets: boolean;
                hasThirdPartyAssets: boolean;
                provenanceUrl: string;
            };
            permissions: {
                camera: boolean;
                deviceLocalStorage: boolean;
            };
        };
    }[];
}>;
export declare function parseEpisodePack(input: unknown): EpisodePack;
export declare function safeParseEpisodePack(input: unknown): import("zod").SafeParseReturnType<{
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}, {
    schemaVersion: 1;
    permissions: {
        camera: boolean;
        deviceLocalStorage: boolean;
    };
    meta: {
        id: string;
        title: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        summary: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        locales: ("en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar")[];
        theme: string;
        ageBands: ("2-3" | "4-5" | "6-7" | "8+")[];
        estMinutes: number;
        engine: {
            minimumVersion: string;
            maximumVersion: string | null;
        };
        compiler: {
            model: string;
            generatedAt: string;
            reasoningEffort: string;
        } | null;
    };
    cast: {
        name: {
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
            text: string;
        }[];
        id: string;
        artAssetId: string | null;
        description: string;
    }[];
    entrySceneId: string;
    scenes: ({
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: false;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    } | {
        kind: "story" | "calibration-check" | "challenge" | "rest" | "celebration";
        id: string;
        energy: "calm" | "medium" | "high";
        narration: {
            items: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
                audioAssetId: string | null;
            }[];
            captionDefaultOn: true;
        };
        challenge: {
            type: "touch_targets";
            count: number;
            zone: "upper" | "lower" | "full" | "reachable";
            targetScale: number;
            dwellMs: number;
            limb: "hands" | "feet" | "any";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
        } | {
            type: "jump_count";
            count: number;
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            countAloud: boolean;
        } | {
            type: "squat";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            reps: number;
        } | {
            type: "freeze";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            cue: "music-stop" | "narration" | "visual";
        } | {
            type: "run_in_place";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            durationMs: number;
            intensity: "stroll" | "jog" | "sprint";
        } | {
            type: "balance";
            timeBudgetMs: number;
            successAudioId: string;
            encourageAudioId: string;
            holdMs: number;
            pose: "one-leg" | "airplane" | "tiptoe" | "statue";
        } | null;
        terminal: true;
        transitions: {
            on: "success" | "partial" | "struggle" | "always";
            to: string;
            adapt: {
                targetScaleMul: number;
                dwellMsMul: number;
                countDelta: number;
                timeBudgetMul: number;
            } | null;
        }[];
        demo: {
            characterId: string;
            animation: string;
        } | null;
        learning: {
            kind: "counting" | "colors" | "letters" | "body-parts" | "directions" | "animals" | "none";
            payload: string[];
        } | null;
        artAssetId: string | null;
    })[];
    adaptPolicy: {
        targetSuccessBand: [number, number];
        maxStruggleStreak: number;
        maxHighEnergyMs: number;
    };
    assets: {
        images: {
            path: string;
            id: string;
            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/avif";
            alt: {
                locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
                text: string;
            }[];
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
        }[];
        audio: {
            path: string;
            locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar" | null;
            id: string;
            mediaType: "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/mp4";
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            transcript: string;
        }[];
        music: {
            id: string;
            license: {
                spdxId: string;
                name: string;
                url: string | null;
                attribution: string | null;
            };
            provenance: {
                kind: "original";
                creator: string;
                createdAt: string;
            } | {
                kind: "generated";
                tool: string;
                model: string;
                prompt: string;
                generatedAt: string;
            } | {
                kind: "third-party";
                creator: string;
                sourceUrl: string;
                retrievedAt: string;
            };
            generator: "tone.js";
            seed: number;
            mood: "adventure" | "calm" | "silly" | "victory";
        }[];
    };
}>;
export declare function parsePackProvenance(input: unknown): PackProvenance;
export declare function safeParsePackProvenance(input: unknown): import("zod").SafeParseReturnType<{
    schemaVersion: 1;
    assets: {
        path: string | null;
        license: {
            spdxId: string;
            name: string;
            url: string | null;
            attribution: string | null;
        };
        provenance: {
            kind: "original";
            creator: string;
            createdAt: string;
        } | {
            kind: "generated";
            tool: string;
            model: string;
            prompt: string;
            generatedAt: string;
        } | {
            kind: "third-party";
            creator: string;
            sourceUrl: string;
            retrievedAt: string;
        };
        assetId: string;
    }[];
}, {
    schemaVersion: 1;
    assets: {
        path: string | null;
        license: {
            spdxId: string;
            name: string;
            url: string | null;
            attribution: string | null;
        };
        provenance: {
            kind: "original";
            creator: string;
            createdAt: string;
        } | {
            kind: "generated";
            tool: string;
            model: string;
            prompt: string;
            generatedAt: string;
        } | {
            kind: "third-party";
            creator: string;
            sourceUrl: string;
            retrievedAt: string;
        };
        assetId: string;
    }[];
}>;
export declare function parsePlayerProfile(input: unknown): PlayerProfile;
export declare function safeParsePlayerProfile(input: unknown): import("zod").SafeParseReturnType<{
    locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
    createdAt: string;
    id: string;
    schemaVersion: 1;
    displayName: string;
    ageBand: "2-3" | "4-5" | "6-7" | "8+";
    measured: {
        reachBox: {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        };
        shoulderYRatio: number;
        tempoBpm: number;
        reactionMsP50: number;
        comprehensionChannel: "audio" | "visual-demo" | "both";
    };
    abilities: {
        seatedMode: boolean;
        canJump: boolean;
        activeSide: "both" | "left" | "right";
    };
    sensory: {
        captions: boolean;
        highContrast: boolean;
        reducedStimulation: boolean;
        audioCues: boolean;
    };
    skill: {
        touch_targets: number;
        jump_count: number;
        squat: number;
        freeze: number;
        run_in_place: number;
        balance: number;
    };
}, {
    locale: "en" | "ko" | "es" | "ja" | "zh" | "fr" | "de" | "ar";
    createdAt: string;
    id: string;
    schemaVersion: 1;
    displayName: string;
    ageBand: "2-3" | "4-5" | "6-7" | "8+";
    measured: {
        reachBox: {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        };
        shoulderYRatio: number;
        tempoBpm: number;
        reactionMsP50: number;
        comprehensionChannel: "audio" | "visual-demo" | "both";
    };
    abilities: {
        seatedMode: boolean;
        canJump: boolean;
        activeSide: "both" | "left" | "right";
    };
    sensory: {
        captions: boolean;
        highContrast: boolean;
        reducedStimulation: boolean;
        audioCues: boolean;
    };
    skill: {
        touch_targets: number;
        jump_count: number;
        squat: number;
        freeze: number;
        run_in_place: number;
        balance: number;
    };
}>;
export declare function parseSessionStats(input: unknown): SessionStats;
export declare function safeParseSessionStats(input: unknown): import("zod").SafeParseReturnType<{
    schemaVersion: 1;
    scenes: {
        reactionMsP50: number | null;
        sceneId: string;
        challengeType: "touch_targets" | "jump_count" | "squat" | "freeze" | "run_in_place" | "balance" | null;
        outcome: "success" | "partial" | "struggle" | null;
        attempts: number;
        activeMs: number;
    }[];
    episodeId: string;
    startedAt: string;
    totals: {
        activeMs: number;
        jumps: number;
        touches: number;
    };
}, {
    schemaVersion: 1;
    scenes: {
        reactionMsP50: number | null;
        sceneId: string;
        challengeType: "touch_targets" | "jump_count" | "squat" | "freeze" | "run_in_place" | "balance" | null;
        outcome: "success" | "partial" | "struggle" | null;
        attempts: number;
        activeMs: number;
    }[];
    episodeId: string;
    startedAt: string;
    totals: {
        activeMs: number;
        jumps: number;
        touches: number;
    };
}>;
//# sourceMappingURL=parsers.d.ts.map