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

import * as assert from "assert";

import { IterablePromiseImpl } from "../../query/enumerablePromise";
import { first } from "../../query/operators";

describe("IterablePromise sources", () => {
    describe("range", () => {
        it("produces an empty array for overlapping ranges", async () => {
            let xs = await IterablePromiseImpl.range(0, 0).toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.range(0, -1).toArray();
            assert.deepEqual(xs, []);
        });

        it("produces an array of one for boundary case", async () => {
            const xs = await IterablePromiseImpl.range(0, 1).toArray();
            assert.deepEqual(xs, [0]);
        });

        it("can produce a range including negative numbers", async () => {
            const xs = await IterablePromiseImpl.range(-3, 2).toArray();
            assert.deepEqual(xs, [-3, -2, -1, 0, 1]);
        });

        it("is lazily evaluated by take when range is infinite", async () => {
            const xs = await IterablePromiseImpl.range(0)
                .take(5)
                .toArray();
            assert.deepEqual(xs, [0, 1, 2, 3, 4]);
        });

        it("is lazily transformed and filtered when range is infinite", async () => {
            const xs = await IterablePromiseImpl.range(0)
                .map(x => x + 2)
                // If filter is bigger than the take window, we enumerate all numbers and hang
                // forever.
                .filter(x => x <= 10)
                .take(7)
                .map(x => x - 2)
                .filter(x => x > 3)
                .toArray();
            assert.deepEqual(xs, [4, 5, 6]);
        });

        it("is lazily flatMap'd when range is infinite", async () => {
            const xs = await IterablePromiseImpl.range(0)
                // If filter is bigger than the take window, we enumerate all numbers and hang
                // forever.
                .flatMap(x => (x <= 10 ? [x, x] : []))
                .take(5)
                .toArray();
            assert.deepEqual(xs, [0, 0, 1, 1, 2]);
        });
    });
});

describe("IterablePromise restriction operators", () => {
    describe("filter", () => {
        it("produces [] when all elements are filtered out", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .filter(x => x < 0)
                .toArray();
            assert.deepEqual(xs, []);
        });

        it("produces an non-empty array when some elements are filtered out", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .filter(x => x >= 3)
                .toArray();
            assert.deepEqual(xs, [3, 4]);
        });
    });
});

describe("IterablePromise projection operators", () => {
    describe("map", () => {
        it("x => x does identity transformation", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .map(x => x)
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);
        });

        it("x => x+1 adds one to every element", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .map(x => x + 1)
                .toArray();
            assert.deepEqual(xs, [2, 3, 4, 5]);
        });
    });

    describe("flatMap", () => {
        it("produces [] when all elements are filtered out", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .flatMap(x => [])
                .toArray();
            assert.deepEqual(xs, []);
        });

        it("can add elements to an enumerable", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .flatMap(x => [x, x])
                .toArray();
            assert.deepEqual(xs, [1, 1, 2, 2, 3, 3, 4, 4]);
        });
    });
});

describe("IterablePromise partitioning operators", () => {
    describe("skip", () => {
        it("produces [] when all elements are skipped", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .skip(4)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .skip(4)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            )
                .skip(4)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .skip(0)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            )
                .skip(0)
                .toArray();
            assert.deepEqual(xs, []);
        });

        it("produces non-empty array when not all elements are skipped", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .skip(4)
                .toArray();
            assert.deepEqual(xs, [5]);

            xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .skip(0)
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4, 5]);
        });

        it("throws exception when negative number is provided for n, part 1", async () => {
            try {
                IterablePromiseImpl.from([1, 2, 3, 4, 5])
                    .skip(-1)
                    .toArray();
            } catch (e) {
                return;
            }
            assert.fail();
        });

        it("throws exception when negative number is provided for n, part 2", async () => {
            try {
                IterablePromiseImpl.from([])
                    .skip(-1)
                    .toArray();
            } catch (e) {
                return;
            }
        });
    });

    describe("skipWhile", () => {
        it("produces [] when all elements are skipped", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .skipWhile(x => true)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .skipWhile(x => false)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .skipWhile(x => true)
                .toArray();
            assert.deepEqual(xs, []);
        });

        it("produces non-empty array when not all elements are skipped", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .skipWhile(x => x < 2)
                .toArray();
            assert.deepEqual(xs, [2, 3, 4]);

            xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .skipWhile((x, i) => i < 1)
                .toArray();
            assert.deepEqual(xs, [2, 3, 4]);
        });

        it("does not invoke the predicate again after it returns false one time", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .skipWhile(x => x < 2 || x > 3)
                .toArray();
            assert.deepEqual(xs, [2, 3, 4, 5]);
        });
    });

    describe("take", () => {
        it("produces [] when no elements are taken", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .take(0)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .take(4)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .take(0)
                .toArray();
            assert.deepEqual(xs, []);
        });

        it("produces non-empty array when some elements are taken", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .take(4)
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);

            xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .take(8)
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4, 5]);

            xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .take(5)
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4, 5]);
        });

        it("throws exception when negative number is provided for n, part 1", async () => {
            try {
                await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                    .take(-1)
                    .toArray();
            } catch (e) {
                return;
            }
            assert.fail();
        });

        it("throws exception when negative number is provided for n, part 2", async () => {
            try {
                await IterablePromiseImpl.from([])
                    .take(-1)
                    .toArray();
            } catch (e) {
                return;
            }
            assert.fail();
        });
    });

    describe("takeWhile", () => {
        it("produces [] when no elements are taken", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .takeWhile(x => false)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .takeWhile(x => true)
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from([])
                .takeWhile(x => false)
                .toArray();
            assert.deepEqual(xs, []);
        });

        it("produces non-empty array when some elements are taken", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .takeWhile(x => x <= 2)
                .toArray();
            assert.deepEqual(xs, [1, 2]);

            xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .takeWhile((x, i) => i <= 1)
                .toArray();
            assert.deepEqual(xs, [1, 2]);
        });

        it("does not invoke the predicate again after it returns false one time", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4, 5])
                .takeWhile(x => x <= 2 || x > 4)
                .toArray();
            assert.deepEqual(xs, [1, 2]);
        });
    });
});

describe("IterablePromise concatenation operators", () => {
    describe("concat", () => {
        //
        // These tests exist, in part, to make sure that type inference works for the complex types
        // in the signatures of `concat` and `from`.
        //

        it("concats T[]", async () => {
            let xs = await IterablePromiseImpl.from([1, 2])
                .concat([3, 4])
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);

            xs = await IterablePromiseImpl.from<number>([])
                .concat([3, 4])
                .toArray();
            assert.deepEqual(xs, [3, 4]);

            xs = await IterablePromiseImpl.from([1, 2])
                .concat([])
                .toArray();
            assert.deepEqual(xs, [1, 2]);
        });

        it("concats Promise<T[]>", async () => {
            let xs = await IterablePromiseImpl.from(Promise.resolve([1, 2]))
                .concat([3, 4])
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);

            xs = await IterablePromiseImpl.from([1, 2])
                .concat(Promise.resolve([3, 4]))
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);

            xs = await IterablePromiseImpl.from<number>(Promise.resolve([]))
                .concat([3, 4])
                .toArray();
            assert.deepEqual(xs, [3, 4]);

            xs = await IterablePromiseImpl.from<number>([])
                .concat(Promise.resolve([3, 4]))
                .toArray();
            assert.deepEqual(xs, [3, 4]);

            xs = await IterablePromiseImpl.from(Promise.resolve([1, 2]))
                .concat([])
                .toArray();
            assert.deepEqual(xs, [1, 2]);

            xs = await IterablePromiseImpl.from([1, 2])
                .concat(Promise.resolve([]))
                .toArray();
            assert.deepEqual(xs, [1, 2]);
        });

        it("concats iterators", async () => {
            let xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2]) {
                        yield x;
                    }
                })(),
            )
                .concat([3, 4])
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);

            xs = await IterablePromiseImpl.from([1, 2])
                .concat(
                    (function*() {
                        for (const x of [3, 4]) {
                            yield x;
                        }
                    })(),
                )
                .toArray();
            assert.deepEqual(xs, [1, 2, 3, 4]);

            xs = await IterablePromiseImpl.from<number>(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            )
                .concat([3, 4])
                .toArray();
            assert.deepEqual(xs, [3, 4]);

            xs = await IterablePromiseImpl.from<number>([])
                .concat(
                    (function*() {
                        for (const x of [3, 4]) {
                            yield x;
                        }
                    })(),
                )
                .toArray();
            assert.deepEqual(xs, [3, 4]);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2]) {
                        yield x;
                    }
                })(),
            )
                .concat([])
                .toArray();
            assert.deepEqual(xs, [1, 2]);

            xs = await IterablePromiseImpl.from([1, 2])
                .concat(
                    (function*() {
                        for (const x of []) {
                            yield x;
                        }
                    })(),
                )
                .toArray();
            assert.deepEqual(xs, [1, 2]);
        });
    });
});

describe("IterablePromise ordering operators", () => {
    describe("reverse", () => {
        it("produces [] for empty array", async () => {
            let xs = await IterablePromiseImpl.from([])
                .reverse()
                .toArray();
            assert.deepEqual(xs, []);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            )
                .reverse()
                .toArray();
            assert.deepEqual(xs, []);
        });
    });
});

describe("IterablePromise element operators", () => {
    describe("first", () => {
        it("throws error if enumerable is empty", async () => {
            assert.rejects(IterablePromiseImpl.from([]).first());
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of []) {
                            yield x;
                        }
                    })(),
                ).first(),
            );
        });

        it("throws error if predicate specifies non-existent element", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2, 3]).first(x => x === 4));
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2, 3]) {
                            yield x;
                        }
                    })(),
                ).first(x => x === 4),
            );
        });

        it("finds first element of sequence", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).first();
            assert.deepEqual(xs, 1);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).first();
            assert.deepEqual(xs, 1);
        });
    });

    describe("firstOrDefault", () => {
        it("default value populated if enumerable is empty", async () => {
            let xs = await IterablePromiseImpl.from<number>([]).firstOrDefault(99);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from<number>(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            ).firstOrDefault(99);
            assert.deepEqual(xs, 99);
        });

        it("default value if predicate specifies non-existent element", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).firstOrDefault(99, x => x === 4);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).firstOrDefault(99, x => x === 4);
            assert.deepEqual(xs, 99);
        });

        it("finds first element of sequence", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).firstOrDefault(99);
            assert.deepEqual(xs, 1);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).firstOrDefault(99);
            assert.deepEqual(xs, 1);
        });
    });

    describe("last", () => {
        it("throws error if enumerable is empty", async () => {
            assert.rejects(IterablePromiseImpl.from([]).last());
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of []) {
                            yield x;
                        }
                    })(),
                ).last(),
            );
        });

        it("throws error if predicate specifies non-existent element", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2, 3]).last(x => x === 4));
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2, 3]) {
                            yield x;
                        }
                    })(),
                ).last(x => x === 4),
            );
        });

        it("finds last element of sequence", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).last();
            assert.deepEqual(xs, 3);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).last();
            assert.deepEqual(xs, 3);
        });
    });

    describe("lastOrDefault", () => {
        it("default value populated if enumerable is empty", async () => {
            let xs = await IterablePromiseImpl.from<number>([]).lastOrDefault(99);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from<number>(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            ).lastOrDefault(99);
            assert.deepEqual(xs, 99);
        });

        it("default value if predicate specifies non-existent element", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).firstOrDefault(99, x => x === 4);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).firstOrDefault(99, x => x === 4);
            assert.deepEqual(xs, 99);
        });

        it("finds first element of sequence", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).lastOrDefault(99);
            assert.deepEqual(xs, 3);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).lastOrDefault(99);
            assert.deepEqual(xs, 3);
        });
    });

    describe("single", () => {
        it("throws error if enumerable is empty", async () => {
            assert.rejects(IterablePromiseImpl.from([]).single());
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of []) {
                            yield x;
                        }
                    })(),
                ).single(),
            );
        });

        it("throws error if enumerable has more than 1 element", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2]).single());
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2]) {
                            yield x;
                        }
                    })(),
                ).single(),
            );
        });

        it("throws error if predicate specifies non-existent element", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2, 3]).single(x => x === 4));
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2, 3]) {
                            yield x;
                        }
                    })(),
                ).single(x => x === 4),
            );
        });

        it("throws error if predicate specifies multiple elements", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2, 2, 3]).single(x => x === 2));
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2, 2, 3]) {
                            yield x;
                        }
                    })(),
                ).single(x => x === 2),
            );
        });

        it("finds single element of sequence", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).single(x => x === 2);
            assert.deepEqual(xs, 2);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).single(x => x === 2);
            assert.deepEqual(xs, 2);

            xs = await IterablePromiseImpl.from([1]).single();
            assert.deepEqual(xs, 1);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1]) {
                        yield x;
                    }
                })(),
            ).single();
            assert.deepEqual(xs, 1);
        });
    });

    describe("singleOrDefault", () => {
        it("default value if enumerable is empty", async () => {
            let xs = await IterablePromiseImpl.from<number>([]).singleOrDefault(99);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [99]) {
                        yield x;
                    }
                })(),
            ).singleOrDefault(99);
            assert.deepEqual(xs, 99);
        });

        it("throw error if enumerable has more than 1 element and default predicate", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2]).singleOrDefault(99));
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2]) {
                            yield x;
                        }
                    })(),
                ).singleOrDefault(99),
            );
        });

        it("default value if predicate specifies non-existent element", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).singleOrDefault(99, x => x === 4);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).singleOrDefault(99, x => x === 4);
            assert.deepEqual(xs, 99);
        });

        it("throws error if predicate specifies multiple elements", async () => {
            assert.rejects(
                IterablePromiseImpl.from([1, 2, 2, 3]).singleOrDefault(99, x => x === 2),
            );
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1, 2, 2, 3]) {
                            yield x;
                        }
                    })(),
                ).singleOrDefault(99, x => x === 2),
            );
        });

        it("finds single element of sequence", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).singleOrDefault(99, x => x === 2);
            assert.deepEqual(xs, 2);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).singleOrDefault(99, x => x === 2);
            assert.deepEqual(xs, 2);

            xs = await IterablePromiseImpl.from([1]).singleOrDefault(99);
            assert.deepEqual(xs, 1);

            xs = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1]) {
                        yield x;
                    }
                })(),
            ).singleOrDefault(99);
            assert.deepEqual(xs, 1);
        });
    });

    describe("elementAt", () => {
        it("finds element at in-range index", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3]).elementAt(1);
            assert.deepEqual(xs, 2);
        });

        it("throws error if index is out-of-range", async () => {
            assert.rejects(IterablePromiseImpl.from([1, 2, 3]).elementAt(3));
            // assert.rejects(
            //     IterablePromiseImpl.from(
            //         (function*() {
            //             for (const x of [1]) {
            //                 yield x;
            //             }
            //         })(),
            //     ).elementAt(0),
            // );
            assert.rejects(IterablePromiseImpl.from([]).elementAt(0));
            assert.rejects(IterablePromiseImpl.from([]).elementAt(-1));
            assert.rejects(
                IterablePromiseImpl.from(
                    (function*() {
                        for (const x of [1]) {
                            yield x;
                        }
                    })(),
                ).elementAt(-1),
            );
        });
    });

    describe("elementAtOrDefault", () => {
        it("finds element at in-range index", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3]).elementAtOrDefault(99, 1);
            assert.deepEqual(xs, 2);
        });

        it("default value if index is out-of-range", async () => {
            let xs = await IterablePromiseImpl.from([1, 2, 3]).elementAtOrDefault(99, 3);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from<number>([]).elementAtOrDefault(99, 0);
            assert.deepEqual(xs, 99);

            xs = await IterablePromiseImpl.from<number>([]).elementAtOrDefault(99, -1);
            assert.deepEqual(xs, 99);
        });
    });

    describe("defaultIfEmpty", () => {
        it("default value if empty", async () => {
            const xs = await IterablePromiseImpl.from<number>([])
                .defaultIfEmpty(99)
                .toArray();
            assert.deepEqual(xs, [99]);
        });

        it("identity if not empty", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3])
                .defaultIfEmpty(99)
                .toArray();
            assert.deepEqual(xs, [1, 2, 3]);
        });
    });
});

describe("IterablePromise quantifier operators", () => {
    describe("any", () => {
        it("false if nothing satisfies predicate", async () => {
            let res = await IterablePromiseImpl.from<number>([]).any(x => x > 3);
            assert.deepEqual(res, false);

            res = await IterablePromiseImpl.from([1]).any(x => x > 3);
            assert.deepEqual(res, false);
        });

        it("true if >= 1 thing satisfies predicate", async () => {
            let res = await IterablePromiseImpl.from([4]).any(x => x > 3);
            assert.deepEqual(res, true);

            res = await IterablePromiseImpl.from([4, 5]).any(x => x > 3);
            assert.deepEqual(res, true);

            res = await IterablePromiseImpl.from([3, 4, 5]).any(x => x > 3);
            assert.deepEqual(res, true);
        });
    });

    describe("all", () => {
        it("empty sequence satisfies predicate", async () => {
            let res = await IterablePromiseImpl.from<number>([]).all(x => x > 3);
            assert.deepEqual(res, true);

            res = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            ).all(x => x > 3);
            assert.deepEqual(res, true);
        });

        it("returns false when not everything satisfies predicate", async () => {
            let res = await IterablePromiseImpl.from([1, 2, 3]).all(x => x > 2);
            assert.deepEqual(res, false);

            res = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [1, 2, 3]) {
                        yield x;
                    }
                })(),
            ).all(x => x > 2);
            assert.deepEqual(res, false);
        });

        it("returns false when not everything satisfies predicate", async () => {
            let res = await IterablePromiseImpl.from([2, 3]).all(x => x >= 2);
            assert.deepEqual(res, true);

            res = await IterablePromiseImpl.from(
                (function*() {
                    for (const x of [2, 3]) {
                        yield x;
                    }
                })(),
            ).all(x => x >= 2);
            assert.deepEqual(res, true);
        });
    });
});

describe("IterablePromise quantifier operators", () => {
    describe("count", () => {
        it("returns 0 for empty lists", async () => {
            let res = await IterablePromiseImpl.from<number>([]).count();
            assert.deepEqual(res, 0);

            res = await IterablePromiseImpl.from<number>(
                (function*() {
                    for (const x of []) {
                        yield x;
                    }
                })(),
            ).count();
            assert.deepEqual(res, 0);
        });

        it("returns > 1 count for non-empty lists", async () => {
            let res = await IterablePromiseImpl.from([1]).count();
            assert.deepEqual(res, 1);

            res = await IterablePromiseImpl.from([1, 2]).count();
            assert.deepEqual(res, 2);
        });
    });
});

describe("IterablePromise eval operators", () => {
    describe("toArray", () => {
        it("returns empty array for empty enumerable", async () => {
            const xs = await IterablePromiseImpl.from([]).toArray();
            assert.deepEqual(xs, []);
        });
    });
});

describe("IterablePromise iterable interop operators", () => {
    describe("pipe", () => {
        it("allows composition of multiple async iterators", async () => {
            const xs = await IterablePromiseImpl.from([1, 2, 3, 4])
                .pipe(
                    async function*(source) {
                        for await (const t of source) {
                            if (t > 2) {
                                yield t;
                            }
                        }
                    },
                    async function*(source) {
                        for await (const t of source) {
                            yield t + 2;
                        }
                    },
                )
                .toArray();
            assert.deepEqual(xs, [5, 6]);
        });
    });
});
