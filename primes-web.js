/*
    Copyright (C) 2025 Alpar Duman
    This file is part of primes-web.

    primes-web is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as
    published by the Free Software Foundation.

    primes-web is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with primes-web. If not, see
    <https://github.com/AlparDuman/primes-web/blob/main/LICENSE>
    else <https://www.gnu.org/licenses/>.
*/

/**
 * Set of methods for prime numbers.
 * - Check if a single number is a prime number
 * - Count prime numbers in given range
 * - Get a List of prime numbers in given range
 * Each category has 3 algorithms and a default method that uses the recommended algorithm
 * - Trial Division
 * - Sieve Eratosthenes
 * - Bucket Sieve
 */
class primes_web {
    #low_set;
    #low_set_last;
    #low_set_ready;

    /**
     * Initiate and starts asynchronously generate a low set
     */
    constructor() {
        this.#low_set = [];
        this.#low_set_last = 0;
        this.#low_set_ready = false;
        this.#generateLowSet(Number.MAX_SAFE_INTEGER);
    }

    /**
     * Generate low set of relevant prime numbers for range
     * @param {number} range
    */
    async #generateLowSet(range, report_to_console = true) {
        range = Math.floor(Math.sqrt(range));
        let timing_start = Date.now();
        if (range >= 2) this.#low_set.push(2);
        if (range >= 3) this.#low_set.push(3);
        if (range >= 5) this.#low_set.push(5);
        const sieveField = new primes_web.BitArray(range);
        const range_sqrt = Math.floor(Math.sqrt(range));
        let candidate = 7, oddMultiple;
        for (; candidate <= range_sqrt; candidate += 2)
            if (!sieveField.get(candidate, true)) {
                this.#low_set.push(candidate);
                const stepMultiple = candidate * 2;
                for (oddMultiple = candidate + stepMultiple; oddMultiple <= range; oddMultiple += stepMultiple)
                    sieveField.set(oddMultiple, true);
            }
        for (; candidate <= range; candidate += 2)
            if (!sieveField.get(candidate, true))
                this.#low_set.push(candidate);
        this.#low_set_last = this.#low_set[this.#low_set.length - 1];
        this.#low_set_ready = true;
        let timing_end = Date.now();
        if (report_to_console)
            console.log(`[primes-web] Generated ${this.#low_set.length} prime numbers in ${Math.round((timing_end - timing_start))} ms for low set in range from 0 to ${range}`);
    }

    // ====================[ check ]====================

    /**
     * Check if prime number via recommended algorithm
     * @param {number} number
     * @returns {boolean} is a prime number
     */
    isPrime(number) {
        return this.isPrimeBucketSieve(number);
    }

    /**
     * Check if prime number via trail division
     * @param {number} number
     * @returns {boolean} is prime number
     */
    isPrimeTrialDivision(number) {
        [number] = this.#prepareParameters([number]);
        if (number < 2 || number != 2 && number % 2 == 0)
            return false;
        const number_sqrt = Math.floor(Math.sqrt(number));
        for (let candidate = 3; candidate <= number_sqrt; candidate += 2)
            if (number % candidate == 0)
                return false;
        return true;
    }

    /**
     * Check if prime number via sieve of eratosthenes
     * @param {number} number
     * @returns {boolean} is prime number
     */
    isPrimeSieveEratosthenes(number) {
        [number] = this.#prepareParameters([number]);
        if (number < 2) return false;
        const sieveField = new Array(number + 1).fill(true);
        sieveField[0] = sieveField[1] = false;
        const number_sqrt = Math.floor(Math.sqrt(number));
        for (let next = 2; next <= number_sqrt; next++)
            if (sieveField[next])
                for (let multiple = next * 2; multiple <= number; multiple += next)
                    sieveField[multiple] = false;
        return sieveField[number];
    }

    /**
     * Check if prime number with bucket sieve's low set
     * @param {number} number
     * @returns {boolean} is prime number
     */
    isPrimeBucketSieve(number) {
        [number] = this.#prepareParameters([number]);
        if (!this.#low_set_ready)
            throw Error('Low set of prime numbers is not ready');
        if (number <= this.#low_set_last) {
            if (number < 2 )
                return false;
            for (candidate in this.#low_set)
                if (number == candidate)
                    return true;
            return false;
        } else {
            for (candidate in this.#low_set)
                if (number % candidate == 0)
                    return false;
            return true;
        }
    }

    // ====================[ counter ]====================

    countPrimes(range_start, range_end) {
        return countPrimesBucketSieve(range_start, range_end);
    }

    /**
     * Get a count of all prime numbers in a given range using trail division
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    countPrimesTrialDivision(range_start, range_end) {
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        if (range_start > range_end)
            [range_start, range_end] = [range_end, range_start];
        let counter = 0;
        if (range_start <= 2 && range_end >= 2) counter++;
        for (let candidate = range_start % 2 == 1 ? range_start : range_start++; candidate <= range_end; candidate += 2)
            if (this.isPrimeTrialDivision(candidate))
                counter++;
        return counter;
    }


    /**
     * Get a count of all prime numbers in a given range using eratosthenes sieving
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    countPrimesSieveEratosthenes(range_start, range_end) {
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        if (range_start > range_end)
            [range_start, range_end] = [range_end, range_start];
        let counter = 0;
        const field = new Array(range_end).fill(true);
        for (let candidate = 2; candidate <= range_end; candidate++)
            if (field[candidate]) {
                if (candidate >= range_start)
                    counter++;
                for (let multiple = candidate * 2; multiple <= range_end; multiple += candidate)
                    field[multiple] = false;
            }
        return counter;
    }

    countPrimesBucketSieve(range_start, range_end) {
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        let counter = 0;

        // WIP
        
        return counter;
    }

    // ====================[ list ]====================

    /**
     * Get a list of all prime numbers in a given range using recommended algorithm
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    getPrimes(range_start, range_end) {
        return getPrimesBucketSieve(range_start, range_end);
    }

    /**
     * Get a list of all prime numbers in a given range using trail division
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    getPrimesTrialDivision(range_start, range_end) {
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        const primes = [];
        if (range_start <= 2 && range_end >= 2) primes.push(2);
        for (let candidate = range_start % 2 == 1 ? range_start : range_start++; candidate <= range_end; candidate += 2)
            if (this.isPrimeTrialDivision(candidate))
                primes.push(candidate);
        return primes;
    }

    /**
     * Get a list of all prime numbers in a given range using eratosthenes sieving
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    getPrimesSieveEratosthenes(range_start, range_end) {
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        const primes = [], field = new Array(range_end).fill(true);
        for (let candidate = 2; candidate <= range_end; candidate++)
            if (field[candidate]) {
                if (candidate >= range_start)
                    primes.push(candidate);
                for (let multiple = candidate * 2; multiple <= range_end; multiple += candidate)
                    field[multiple] = false;
            }
        return primes;
    }

    getPrimesBucketSieve(range_start, range_end) {
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        if (!this.#low_set_ready)
            throw new Error(`Low set of prime numbers is not ready`);
        const primes = [];

        // WIP

        // case 0: range_start is below - range_end is below - no results
        // case 1: range_start is below - range_end is in low set - low set result
        // case 2: range_start is below - range_end is in high set - low & high set result
        // case 3: range_start is in low set - range_end is in low set - low set result
        // case 4: range_start is in low set - range_end is in high set - low & high set result
        // case 6: range_start is in high set - range_end is in high set - high set result

        return primes;
    }

    // ====================[ prepare parameters ]====================

    /**
     * Prepares paramters if of type number, are safe integer and sorts
     * @param {array} paramters
     * @returns {array} sorted numbers
     */
    #prepareParameters(parameters) {
        for (let parameter in parameters) {
            if (typeof parameter !== 'number')
                throw new Error(`Argument of type ${typeof parameter} given, but type of number expected`);
            if (!Number.isSafeInteger(parameter))
                throw new Error(`Argument with not safe integer given`);
        }
        if (parameters.length >= 2)
            if (parameters[0] > parameters[1])
                [parameters[0], parameters[1]] = [parameters[1], parameters[0]];
        return parameters;
    }

    // ====================[ bit array ]====================

    /**
     * internal class for 2,3,5 wheel factorized bit arrays
     */
    static BitArray = class {
        #mask;
        #size;
        #data;

        /**
         * Initializes mask and field
         * @param {number} size 
         */
        constructor(size) {
            if (typeof size !== 'number')
                throw new Error(`For parameter 'size' argument of type ${typeof size} given, but type of number expected`);
            if (!Number.isSafeInteger(size) || size < 1)
                throw new Error(`For parameter 'size' argument must be between 1 and max safe integer`);
            this.#mask = [0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80];
            this.#data = new Uint8Array(Math.floor(size / 30) + 1);
            this.#size = size;
        }

        /**
         * Set number in the field
         * @param {number} number 
         */
        set(number, skip_checks = false) {
            if (!skip_checks) {
                if (typeof number !== 'number')
                    throw new Error(`For parameter 'number' argument of type ${typeof number} given, but type of number expected`);
                if (number % 2 == 0 || number < 0 || number > this.#size)
                    return;
            }
            const mask = this.#mask[number % 30];
            if (mask)
                this.#data[Math.floor(number / 30)] |= mask;
        }

        /**
         * Get is non prime number mark from field
         * @param {number} number 
         * @returns {number} is marked as non prime number
         */
        get(number, skip_checks = false) {
            if (!skip_checks) {
                if (typeof number !== 'number')
                    throw new Error(`For parameter 'number' argument of type ${typeof number} given, but type of number expected`);
                if (number % 2 == 0 || number < 7 || number > this.#size)
                    return 1;
            }
            const mask = this.#mask[number % 30];
            if (mask)
                return this.#data[Math.floor(number / 30)] & mask;
            return 1;
        }
    }
}

