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
 * Check if a number is prime or get a list of prime numbers [Works up to max safe integer]
 */
class primes_web {
    #count;
    #list;
    #list_start;
    #list_end;
    #low_set;
    #low_set_last;
    #low_set_ready;

    /**
     * Initiates private variables and starts asynchronously populating a low set of prime numbers for later use
     */
    constructor() {
        this.#resetList();
        this.#populateLowSet( Number.MAX_SAFE_INTEGER );
    }

    /**
     * Get the current list of prime numbers
     * @returns {array} prime numbers
     */
    getPrimesList() {
        return this.#list;
    }

    /**
     * Get the count of prime numbers in the current list
     * @returns count of prime numbers
     */
    getPrimesCount() {
        return this.#count;
    }

    /**
     * Resets the current list and count of prime numbers
     */
    #resetList() {
        this.#count = 0;
        this.#list_start = 0;
        this.#list_end = 0;
        this.#list = [];
    }

    /**
     * Resets the low set of prime numbers
     */
    #resetLowSet() {
        this.#low_set_ready = false;
        this.#low_set_last = 0;
        this.#low_set = [];
    }

    /**
     * Populates low set with prime number for later use
     * @param {number} range - range of expected high numbers to prepare for
    */
    async #populateLowSet( range ) {
        // update range for low set
        range = Math.floor( Math.sqrt( range ) );
        // reset low set
        this.#resetLowSet();
        // timing start & reset low set
        console.log( `[primes-web] Populating low set of prime numbers up to the range of ${ range }` );
        let timing_start = Date.now();
        // pre-add before wheel factorization
        if ( range > 1 )
            this.#low_set.push( 2 );
        if ( range > 2 )
            this.#low_set.push( 3 );
        if ( range > 4 )
            this.#low_set.push( 5 );
        // prepare for loops
        const sieveField = new primes_web.BitArray( range );
        const range_sqrt = Math.sqrt( range );
        // check each odd number
        let test = 7, oddMultiple;
        for ( ; test <= range_sqrt; test += 2 )
            // is not marked yet
            if ( !sieveField.get( test, true ) ) {
                // save prime number
                this.#low_set.push( test );
                // mark odd multiples of this as non prime number
                const stepMultiple = test * 2;
                for ( oddMultiple = stepMultiple + test; oddMultiple <= range; oddMultiple += stepMultiple )
                    sieveField.set( oddMultiple, true );
            }
        // save remaining prime numbers
        for (; test <= range; test += 2 )
            if ( !sieveField.get( test, true ) )
                this.#low_set.push( test );
        // save last prime number
        this.#low_set_last = this.#low_set[ this.#low_set.length - 1 ];
        // set ready flag
        this.#low_set_ready = true;
        // timing end & report to console
        let timing_end = Date.now();
        console.log( `[primes-web] Low set of prime numbers contains ${ this.#low_set.length } numbers & prepared in ${ Math.round( ( timing_end - timing_start ) ) } ms` );
    }

    /**
     * Uses recommended algorithm to validate prime number
     * @param {number} number 
     * @returns {boolean} is a prime number
     */
    isPrime( number ) {
        return this.isPrimeFast( number );
    }

    /**
     * Check if prime number via trail division
     * @param {number} number 
     * @returns {boolean} is prime number
     */
    isPrimeTrialDivision( number ) {
        // check type of parameter
        if ( typeof number !== 'number' )
            throw new Error( `For parameter 'number' argument of type ${ typeof number } given, but type of number expected` );
        // check if parameter is a safe integer
        if ( !Number.isSafeInteger( number ) )
            throw new Error( `For parameter 'number' argument with not safe integer given` );
        // is below 2 or is even
        if ( number > 2 && number % 2 == 0 || number < 2 )
            return false;
        // test each odd numbers
        const number_sqrt = Math.sqrt(number);
        for ( let test = 3; test <= number_sqrt; test += 2 )
            // check for common divisor
            if ( number % test == 0 )
                return false;
        // no other divisor found
        return true;
    }

    /**
     * Check if prime number via sieve of eratosthenes
     * @param {number} number 
     * @returns 
     */
    isPrimeSieveEratosthenes( number ) {
        // check type of parameter
        if ( typeof number !== 'number' )
            throw new Error( `For parameter 'number' argument of type ${ typeof number } given, but type of number expected` );
        // check if parameter is a safe integer
        if ( !Number.isSafeInteger( number ) )
            throw new Error( `For parameter 'number' argument with not safe integer given` );
        // is below 2
        if ( number < 2 ) return false;
        // prepare sieve field as bit array
        const sieveField = new Array( number + 1 ).fill( true );
        // mark 0 & 1
        sieveField[ 0 ] = sieveField[ 1 ] = false;
        // iterate each number
        const number_sqrt = Math.sqrt(number);
        for ( let next = 2; next <= number_sqrt; next++ )
            // is not marked yet
            if ( sieveField[ next ] )
                // mark all multiples
                for ( let multiple = next * 2; multiple <= number; multiple += next )
                    sieveField[ multiple ] = false;
        // is number not marked
        return sieveField[ number ];
    }

    /**
     * Check if number is a prime number with prepared low set of prime numbers
     * @param {number} number 
     */
    isPrimeFast( number ) {
        // check type of parameter
        if ( typeof number !== 'number' )
            throw new Error( `For parameter 'number' argument of type ${ typeof number } given, but type of number expected` );
        // check if parameter is a safe integer
        if ( !Number.isSafeInteger( number ) )
            throw new Error( `For parameter 'number' argument with not safe integer given` );
        // abort if low set of prime numbers are not ready yet
        if ( !this.#low_set_ready )
            throw Error( 'Low set of prime numbers is not ready' );
        // number is below 2 or even
        if ( number < 2 || number % 2 == 0 )
            return false;
        // could be in prepared list of prime numbers
        if ( number <= this.#low_set_last ) {
            for ( test in this.#low_set )
                // is in prepared list of prime numbers
                if ( number == test )
                    return true;
            // is not in prepared list of prime numbers
            return false;
        // is not in prepared list of prime numbers
        } else {
            for ( test in this.#low_set )
                // check for common divisor
                if ( number % test == 0 )
                    return false;
            // no common divisor found
            return true;
        }
    }

    /**
     * Get a list if all prime numbers in a given range
     * @param {number} range_start - begin search for prime numbers
     * @param {number} range_end - end search of prime numbers
     * @returns {array} prime numbers
     */
    getPrimes( range_start, range_end, keep_cache = true ) {
        // check type of parameters
        if ( typeof range_start !== 'number' )
            throw new Error( `For parameter 'range_start' argument of type ${ typeof range_start } given, but type of number expected` );
        if ( typeof range_end !== 'number' )
            throw new Error( `For parameter 'range_end' argument of type ${ typeof range_end } given, but type of number expected` );
        if ( typeof keep_cache !== 'number' )
            throw new Error( `For parameter 'keep_cache' argument of type ${ typeof keep_cache } given, but type of boolean expected` );
        // check parameters are safe integers
        if ( !Number.isSafeInteger( range_start ) )
            throw new Error( `For parameter 'range_start' argument with not safe integer given` );
        if ( !Number.isSafeInteger( range_end ) )
            throw new Error( `For parameter 'range_end' argument with not safe integer given` );
        // sort range limiters
        if ( range_start > range_end )
            [ range_start, range_end ] = [ range_end, range_start ];
        // check if already in cache
        if ( keep_cache && range_start == this.#list_start && range_end == this.#list_end )
            return this.#list;
        // reset list of prime numbers
        this.#resetList();
        // init new list with counter
        let newList = [], counter = 0;
        // use low set of prime numbers are ready
        if ( this.#low_set_ready ) {

            // WIP

            // case 0: range_start is below - range_end is below - no results
            // case 1: range_start is below - range_end is in low set - low set result
            // case 2: range_start is below - range_end is in high set - low & high set result
            // case 3: range_start is in low set - range_end is in low set - low set result
            // case 4: range_start is in low set - range_end is in high set - low & high set result
            // case 6: range_start is in high set - range_end is in high set - high set result

            if ( range_end >= 2 ) {
                let current = Math.max( range_start, 2 );

                // fill from low set

                // get high set

            }
        // else use conventional
        } else {
            let number = range_start;
            for (; number < range_end; number++ )
                if ( this.isPrime( number ) ) {
                    newList.push( number );
                    counter++;
                }
        }
        if ( keep_cache ) {
            // set new list limits for cache
            this.#list_start = range_start;
            this.#list_end = range_end;
            this.#count = counter;
            this.#list = newList;
        }
        // return internal list of prime numbers
        return newList;
    }

    /**
     * internal class to handle bit arrays
     */
    static BitArray = class {
        #mask;
        #size;
        #data;

        /**
         * Initializes mask and field
         * @param {number} size 
         */
        constructor( size ) {
            // check if parameter is of type number
            if ( typeof size !== 'number' )
                throw new Error( `For parameter 'size' argument of type ${ typeof size } given, but type of number expected` );
            // check if parameter is safe integer
            if ( !Number.isSafeInteger( size ) || size < 1 )
                throw new Error( `For parameter 'size' argument must be between 1 and max safe integer` );
            // set mask
            this.#mask = [ 0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80 ];
            // create bit field
            this.#data = new Uint8Array( Math.floor( size / 30 ) + 1 );
            // set size
            this.#size = size;
        }

        /**
         * Set number in the field
         * @param {number} number 
         */
        set( number, skip_checks = false ) {
            if ( !skip_checks ) {
                // check if parameter is of type number
                if ( typeof number !== 'number' )
                    throw new Error( `For parameter 'number' argument of type ${ typeof number } given, but type of number expected` );
                if ( number % 2 == 0 || number < 0 || number > this.#size )
                    return;
            }
            // set bit in field that represents the number
            const mask = this.#mask[ number % 30 ];
            if ( mask )
                this.#data[ Math.floor( number / 30 ) ] |= mask;
        }

        /**
         * Get is prime number mark from field for number
         * @param {number} number 
         * @returns {boolean} if number is marked as prime number
         */
        get( number, skip_checks = false ) {
            if ( !skip_checks ) {
                // check if parameter is of type number
                if ( typeof number !== 'number' )
                    throw new Error( `For parameter 'number' argument of type ${ typeof number } given, but type of number expected` );
                if ( number % 2 == 0 || number < 7 || number > this.#size )
                    return 1;
            }
            // check if mask exists & get bit in field that represents the number
            const mask = this.#mask[ number % 30 ];
            if ( mask )
                return this.#data[ Math.floor( number / 30 ) ] & mask;
            // number is not marked
            return 1;
        }
    }
}

