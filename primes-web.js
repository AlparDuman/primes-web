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
        // update range for low set
        range = Math.floor(Math.sqrt(range));
        // timing start
        let timing_start = Date.now();
        // pre-add before wheel factorization
        if (range >= 2) this.#low_set.push(2);
        if (range >= 3) this.#low_set.push(3);
        if (range >= 5) this.#low_set.push(5);
        // prepare for loops
        const sieveField = new primes_web.BitArray(range);
        const range_sqrt = Math.floor(Math.sqrt(range));
        // save non marked as prime number
        let candidate = 7, oddMultiple;
        for (; candidate <= range_sqrt; candidate += 2)
            if (!sieveField.get(candidate, true)) {
                this.#low_set.push(candidate);
                // mark odd multiples of this as non prime number
                const stepMultiple = candidate * 2;
                for (oddMultiple = candidate + stepMultiple; oddMultiple <= range; oddMultiple += stepMultiple)
                    sieveField.set(oddMultiple, true);
            }
        // save remaining prime numbers
        for (; candidate <= range; candidate += 2)
            if (!sieveField.get(candidate, true))
                this.#low_set.push(candidate);
        // save last prime number
        this.#low_set_last = this.#low_set[this.#low_set.length - 1];
        // set ready flag
        this.#low_set_ready = true;
        // timing end & report to console
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
        // prepare paramter
        [number] = this.#prepareParameters([number]);
        // check 75% - 1 cases
        if (number < 2 || number != 2 && number % 2 == 0)
            return false;
        // search for a 3rd divisor
        const number_sqrt = Math.floor(Math.sqrt(number));
        for (let candidate = 3; candidate <= number_sqrt; candidate += 2)
            if (number % candidate == 0)
                return false;
        // no 3rd divisor found
        return true;
    }

    /**
     * Check if prime number via sieve of eratosthenes
     * @param {number} number
     * @returns {boolean} is prime number
     */
    isPrimeSieveEratosthenes(number) {
        // prepare paramter
        [number] = this.#prepareParameters([number]);
        // is below 2
        if (number < 2) return false;
        // prepare sieve field as bit array
        const sieveField = new Array(number + 1).fill(true);
        // mark 0 & 1
        sieveField[0] = sieveField[1] = false;
        // iterate each number
        const number_sqrt = Math.floor(Math.sqrt(number));
        for (let next = 2; next <= number_sqrt; next++)
            // is not marked yet
            if (sieveField[next])
                // mark all multiples
                for (let multiple = next * 2; multiple <= number; multiple += next)
                    sieveField[multiple] = false;
        // is number not marked
        return sieveField[number];
    }

    /**
     * Check if prime number with low set
     * @param {number} number
     * @returns {boolean} is prime number
     */
    isPrimeBucketSieve(number) {
        // prepare paramter
        [number] = this.#prepareParameters([number]);
        // low set is not ready
        if (!this.#low_set_ready)
            throw Error('Low set of prime numbers is not ready');
        // is number 2 in range
        if (number < 2 || number != 2 && number % 2 == 0)
            return false;
        // in low set
        if (number <= this.#low_set_last) {
            for (candidate in this.#low_set)
                if (number == candidate)
                    return true;
            return false;
        // does low set not contain a common divider
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
        // prepare paramters
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        // sort range limiters
        if (range_start > range_end)
            [range_start, range_end] = [range_end, range_start];
        // init counter
        let counter = 0;
        // pre-add the only even number
        if (range_start <= 2 && range_end >= 2) counter++;
        // add odd numbers if prime number
        for (let candidate = range_start % 2 == 1 ? range_start : range_start++; candidate <= range_end; candidate += 2)
            if (this.isPrimeTrialDivision(candidate))
                counter++;
        // return count of prime numbers
        return counter;
    }


    /**
     * Get a count of all prime numbers in a given range using eratosthenes sieving
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    countPrimesSieveEratosthenes(range_start, range_end) {
        // prepare paramters
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        // sort range limiters
        if (range_start > range_end)
            [range_start, range_end] = [range_end, range_start];
        // init counter
        let counter = 0;
        // 

        // WIP
        
        // return count of prime numbers
        return counter;
    }

    countPrimesBucketSieve(range_start, range_end) {
        // prepare paramters
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        // init counter
        let counter = 0;
        // 

        // WIP

        // return count of prime numbers
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
        // prepare paramters
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        // init new list
        const primes = [];
        // 

        // WIP

        // return prime numbers
        return primes;
    }

    /**
     * Get a list of all prime numbers in a given range using eratosthenes sieving
     * @param {number} range_start 
     * @param {number} range_end 
     * @returns {array} prime numbers
     */
    getPrimesSieveEratosthenes(range_start, range_end) {
        // prepare paramters
        [range_start, range_end] = this.#prepareParameters([range_start, range_end]);
        // init new list
        const primes = [];
        // 

        // WIP

        return primes;
    }

    getPrimesBucketSieve(range_start, range_end) {
        // check type of parameters
        if (typeof range_start !== 'number')
            throw new Error(`For parameter 'range_start' argument of type ${typeof range_start} given, but type of number expected`);
        if (typeof range_end !== 'number')
            throw new Error(`For parameter 'range_end' argument of type ${typeof range_end} given, but type of number expected`);
        // check parameters are safe integers
        if (!Number.isSafeInteger(range_start))
            throw new Error(`For parameter 'range_start' argument with not safe integer given`);
        if (!Number.isSafeInteger(range_end))
            throw new Error(`For parameter 'range_end' argument with not safe integer given`);
        // sort range limiters
        if (range_start > range_end)
            [range_start, range_end] = [range_end, range_start];
        // low set is ready
        if (!this.#low_set_ready)
            throw new Error(`Low set of prime numbers is not ready`);
        // init new list
        const primes = [];
        // 

        // WIP
        // case 0: range_start is below - range_end is below - no results
        // case 1: range_start is below - range_end is in low set - low set result
        // case 2: range_start is below - range_end is in high set - low & high set result
        // case 3: range_start is in low set - range_end is in low set - low set result
        // case 4: range_start is in low set - range_end is in high set - low & high set result
        // case 6: range_start is in high set - range_end is in high set - high set result

        // return internal list of prime numbers
        return primes;
    }

    // ====================[ prepare parameters ]====================

    /**
     * Prepares paramters if of type number, are safe integer and sorts
     * @param {array} paramters
     * @returns {array} sorted numbers
     */
    #prepareParameters(parameters) {
        // check types and are safe integer
        for (let parameter in parameters) {
            if (typeof parameter !== 'number')
                throw new Error(`Argument of type ${typeof parameter} given, but type of number expected`);
            if (!Number.isSafeInteger(parameter))
                throw new Error(`Argument with not safe integer given`);
        }
        // sort
        if (parameters.length >= 2)
            if (parameters[0] > parameters[1])
                [parameters[0], parameters[1]] = [parameters[1], parameters[0]];
        // return
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
            // check if parameter is of type number
            if (typeof size !== 'number')
                throw new Error(`For parameter 'size' argument of type ${typeof size} given, but type of number expected`);
            // check if parameter is safe integer
            if (!Number.isSafeInteger(size) || size < 1)
                throw new Error(`For parameter 'size' argument must be between 1 and max safe integer`);
            // set mask
            this.#mask = [0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80];
            // create bit field
            this.#data = new Uint8Array(Math.floor(size / 30) + 1);
            // set size
            this.#size = size;
        }

        /**
         * Set number in the field
         * @param {number} number 
         */
        set(number, skip_checks = false) {
            if (!skip_checks) {
                // check if parameter is of type number
                if (typeof number !== 'number')
                    throw new Error(`For parameter 'number' argument of type ${typeof number} given, but type of number expected`);
                if (number % 2 == 0 || number < 0 || number > this.#size)
                    return;
            }
            // set bit in field that represents the number
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
                // check if parameter is of type number
                if (typeof number !== 'number')
                    throw new Error(`For parameter 'number' argument of type ${typeof number} given, but type of number expected`);
                if (number % 2 == 0 || number < 7 || number > this.#size)
                    return 1;
            }
            // get bit from field that represents the number
            const mask = this.#mask[number % 30];
            if (mask)
                return this.#data[Math.floor(number / 30)] & mask;
            // number is not marked
            return 1;
        }
    }
}

