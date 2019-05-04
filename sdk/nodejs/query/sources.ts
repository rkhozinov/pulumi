// Copyright 2016-2018, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { isAsyncIterable } from "./interfaces";
import { isIterable } from "./util";

export async function* range(start: number, end?: number) {
    let i = start;
    while (true) {
        if (end !== undefined && i >= end) {
            return;
        }
        yield i++;
    }
}

export async function* unit<TSource>(
    source:
        | Iterable<TSource>
        | AsyncIterable<TSource>
        | Promise<Iterable<TSource>>
        | Promise<AsyncIterable<TSource>>,
): AsyncIterableIterator<TSource> {
    let iter: Iterable<TSource> | AsyncIterable<TSource>;
    if (isIterable(source) || isAsyncIterable(source)) {
        iter = source;
    } else {
        iter = await source;
    }

    if (isIterable(iter)) {
        for (const t of iter) {
            yield t;
        }
    } else {
        for await (const t of iter) {
            yield t;
        }
    }
}

export async function* singleton<TSource>(t: TSource): AsyncIterableIterator<TSource> {
    return unit([t]);
}

// public static IEnumerable<TResult> Repeat<TResult>(
//     TResult element,
//     int count);

// public static IEnumerable<TResult> Empty<TResult>();
