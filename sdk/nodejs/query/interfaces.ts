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

//
// NOTE: We don't need `Disposable` or `Enumerator#reset()` yet, but it's worth noting here that we
// didn't include them, and this causes us to diverge slightly from the "canonical" `Enumerable`
// model.
//

export function isAsyncIterable<T>(o: any): o is AsyncIterable<T> {
    return typeof o[Symbol.asyncIterator] === "function";
}

export function isIterable<T>(o: any): o is Iterable<T> {
    return typeof o[Symbol.iterator] === "function";
}

export type Operator<TSource, TResult> = (
    source: AsyncIterableIterator<TSource>,
) => AsyncIterableIterator<TResult>;

export type Evaluator<TSource, TResult> = (
    source: AsyncIterableIterator<TSource>,
) => Promise<TResult>;

export interface IterablePromise<TSource> extends AsyncIterableIterator<TSource> {
    //
    // Restriction operators.
    //

    filter(f: (t: TSource, i: number) => boolean): IterablePromise<TSource>;

    //
    // Projection operators.
    //

    flatMap<TInner, TResult = TInner>(
        selector: (t: TSource, index: number) => Iterable<TInner> | AsyncIterable<TInner>,
        resultSelector?: (t: TSource, ti: TInner) => TResult,
    ): IterablePromise<TResult>;
    map<U>(f: (t: TSource, i: number) => U): IterablePromise<U>;

    //
    // Partitioning operators.
    //

    skip(n: number): IterablePromise<TSource>;
    skipWhile(predicate: (t: TSource, i: number) => boolean): IterablePromise<TSource>;
    take(n: number): IterablePromise<TSource>;
    takeWhile(predicate: (t: TSource, i: number) => boolean): IterablePromise<TSource>;

    //
    // Iterable interop operators.
    //

    pipe(): IterablePromise<TSource>;
    pipe<TResult>(op: Operator<TSource, TResult>): IterablePromise<TResult>;
    pipe<TResult1, TResult2>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
    ): IterablePromise<TResult2>;
    pipe<TResult1, TResult2, TResult3>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
    ): IterablePromise<TResult3>;
    pipe<TResult1, TResult2, TResult3, TResult4>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
        op4: Operator<TResult3, TResult4>,
    ): IterablePromise<TResult4>;
    pipe<TResult1, TResult2, TResult3, TResult4, TResult5>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
        op4: Operator<TResult3, TResult4>,
        op5: Operator<TResult4, TResult5>,
    ): IterablePromise<TResult5>;
    pipe<TResult1, TResult2, TResult3, TResult4, TResult5, TResult6>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
        op4: Operator<TResult3, TResult4>,
        op5: Operator<TResult4, TResult5>,
        op6: Operator<TResult5, TResult6>,
    ): IterablePromise<TResult6>;
    pipe<TResult1, TResult2, TResult3, TResult4, TResult5, TResult6, TResult7>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
        op4: Operator<TResult3, TResult4>,
        op5: Operator<TResult4, TResult5>,
        op6: Operator<TResult5, TResult6>,
        op7: Operator<TResult6, TResult7>,
    ): IterablePromise<TResult7>;
    pipe<TResult1, TResult2, TResult3, TResult4, TResult5, TResult6, TResult7, TResult8>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
        op4: Operator<TResult3, TResult4>,
        op5: Operator<TResult4, TResult5>,
        op6: Operator<TResult5, TResult6>,
        op7: Operator<TResult6, TResult7>,
        op8: Operator<TResult7, TResult8>,
    ): IterablePromise<TResult8>;
    pipe<TResult1, TResult2, TResult3, TResult4, TResult5, TResult6, TResult7, TResult8, TResult9>(
        op1: Operator<TSource, TResult1>,
        op2: Operator<TResult1, TResult2>,
        op3: Operator<TResult2, TResult3>,
        op4: Operator<TResult3, TResult4>,
        op5: Operator<TResult4, TResult5>,
        op6: Operator<TResult5, TResult6>,
        op7: Operator<TResult6, TResult7>,
        op8: Operator<TResult7, TResult8>,
        op9: Operator<TResult8, TResult9>,
        ...ops: Operator<any, any>[]
    ): IterablePromise<TResult9>;

    //
    // Concatenation operators.
    //

    concat(
        iter:
            | Iterable<TSource>
            | AsyncIterable<TSource>
            | Promise<Iterable<TSource>>
            | Promise<AsyncIterable<TSource>>,
    ): IterablePromise<TSource>;

    //
    // Ordering operators.
    //

    reverse(): IterablePromise<TSource>;

    //
    // Element operators.
    //

    first(predicate?: (t: TSource) => boolean): Promise<TSource>;
    firstOrDefault(defaultValue: TSource, predicate?: (t: TSource) => boolean): Promise<TSource>;
    last(predicate?: (t: TSource) => boolean): Promise<TSource>;
    lastOrDefault(defaultValue: TSource, predicate?: (t: TSource) => boolean): Promise<TSource>;
    single(predicate?: (t: TSource) => boolean): Promise<TSource>;
    singleOrDefault(defaultValue: TSource, predicate?: (t: TSource) => boolean): Promise<TSource>;
    elementAt(index: number): Promise<TSource>;
    elementAtOrDefault(defaultValue: TSource, index: number): Promise<TSource>;
    defaultIfEmpty(defaultValue: TSource): IterablePromise<TSource>;

    //
    // Quantifiers.
    //

    any(predicate?: (t: TSource) => boolean): Promise<boolean>;
    all(predicate: (t: TSource) => boolean): Promise<boolean>;
    count(predicate?: (t: TSource) => boolean): Promise<number>;

    //
    // Eval operators.
    //

    toArray(): Promise<TSource[]>;
    forEach(f: (t: TSource) => void): void;
}

export abstract class IterableBase<T> implements AsyncIterableIterator<T> {
    constructor(private readonly core: AsyncIterableIterator<T>) {}

    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this;
    }

    public next(value?: any): Promise<IteratorResult<T>> {
        return this.core.next(value);
    }
}
