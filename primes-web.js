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
    #low_set;
    #low_set_last;
    #low_set_ready;

    /**
     * Initiates private variables and starts asynchronously populating a low set of prime numbers for later use
     */
    constructor() {
        this.#resetList();
        this.#resetLowSet();
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
        this.#list = [];
    }

    /**
     * Resets the low set of prime numbers
     */
    #resetLowSet() {
        this.#low_set = [];
        this.#low_set_last = 0;
        this.#low_set_ready = false;
    }

    /**
     * Populates low set with prime number for later use
     * @param {number} range - range of expected high numbers to prepare for
    */
    async #populateLowSet( range ) {
        // check if parameter is of type number
        if ( typeof range !== 'number' )
            throw new Error( 'Parameter must be a number' );
        // reset low set
        this.#resetLowSet();
        // update range for low set
        range = Math.floor( Math.sqrt( range ) );
        // check limits
        if ( range < 2 )
            return this.#resetLowSet();
        if ( range > Number.MAX_SAFE_INTEGER )
            throw new Error( 'The range exceeds the maximum safe integer' );
        // pre-add before wheel factorization
        if ( range > 1 )
            this.#low_set.push( 2 );
        if ( range > 2 )
            this.#low_set.push( 3 );
        if ( range > 4 )
            this.#low_set.push( 5 );
        // prepare for loops
        const sieveField = new BitArray( range );
        const range_sqrt = Math.sqrt( range );
        // check each odd number
        let test = 7, multiple;
        for ( ; test <= range_sqrt; test += 2 )
            // is not marked yet
            if ( sieveField.get( test ) ) {
                // save prime number
                this.#low_set.push( test );
                // mark multiples of this as non prime number
                for ( multiple = test * 2; j <= range; multiple += test )
                    sieveField.set( multiple );
            }
        // save remaining prime numbers
        for (; test <= range; test += 2 )
            if ( sieveField.get( test ) )
                this.#low_set.push( test );
        // save last prime number
        this.#low_set_last = this.#low_set[ this.#low_set.length - 1 ];
        // set ready flag
        this.#low_set_ready = true;
    }

    /**
     * Default method to check if prime number, uses recommended method for given number
     * @param {number} number 
     * @returns {boolean} is prime number
     */
    isPrime( number ) {
        // check if parameter is of type number
        if ( typeof number !== 'number' )
            throw new Error( 'Parameter must be a number' );
        // use low set of prime numbers if ready
        if ( this.#low_set_ready )
            return isPrimeFast( number );
        // up to arbitrary limit of 2^32, beyond uses "too" much memory
        if ( number < 2 ** 32 )
            return this.isPrimeSieveEratosthenes( number );
        // up to max safe integer, usually 2^53
        if ( number < Number.MAX_SAFE_INTEGER )
            return this.isPrimeTrialDivision( number );
        // avoid unsafe processing range
        throw Error( 'The number used for the check exceeds the maximum safe integer' );
    }

    /**
     * Check if prime number via trail division
     * @param {number} number 
     * @returns {boolean} is prime number
     */
    isPrimeTrialDivision( number ) {
        // check if parameter is of type number
        if ( typeof number !== 'number' )
            throw new Error( 'Parameter must be a number' );
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
        // check if parameter is of type number
        if ( typeof number !== 'number' )
            throw new Error( 'Parameter must be a number' );
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
        // check if parameter is of type number
        if ( typeof number !== 'number' )
            throw new Error( 'Parameter must be a number' );
        // abort if low set of prime numbers are not ready yet
        if ( !this.#low_set_ready )
            throw Error( 'Low set of prime numbers is not ready yet' );
        // number is below 2 or even
        if ( number < 2 || number & 1 == 0 )
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
            if ( typeof number !== 'number' )
                throw new Error( 'Parameter must be a number' );
            // set mask
            this.#mask = [ 0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80 ];
            // set size
            this.#size;
            // create bit field
            this.#data = new Uint8Array( Math.floor( size / 30 ) + 1 );
        }

        /**
         * Set number in the field
         * @param {number} number 
         */
        set( number ) {
            // check if parameter is of type number
            if ( typeof number !== 'number' )
                throw new Error( 'Parameter must be a number' );
            // precheck if number is odd and within represented range in field
            if ( number & 1 == 1 && number >= 0 && number <= this.#size ) {
                // check if mask exists
                const mask = this.#mask[ number % 30 ];
                if ( mask != 0 )
                    // set bit in field that represents the number
                    this.#data[ Math.floor( number / 30 ) ] |= mask;
            }
        }

        /**
         * Get is prime number mark from field for number
         * @param {number} number 
         * @returns {boolean} if number is marked as prime number
         */
        get( number ) {
            // check if parameter is of type number
            if ( typeof number !== 'number' )
                throw new Error( 'Parameter must be a number' );
            // precheck if number below wheel factorization or is even
            if ( number & 1 == 0 || number < 7 || number > this.#size )
                return false;
            // check if mask exists & get bit in field that represents the number
            const mask = this.#mask[ number % 30 ];
            if ( mask && this.#data[ Math.floor( number / 30 ) ] & mask != 0 )
                return true;
            // number is not marked
            return false;
        }
    }

    /**
     * copy of internal class bitarray, to test performance with removed safety checks
     */
    static BitArrayTest = class {
        #mask;
        #data;

        /**
         * Initializes mask and field
         * @param {number} size 
         */
        constructor( size ) {
            this.#mask = [ 0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80 ];
            this.#data = new Uint8Array( Math.floor( size / 30 ) + 1 );
        }

        /**
         * Set number in the field
         * @param {number} number 
         */
        set( number ) {
            const mask = this.#mask[ number % 30 ];
            if ( mask != 0 )
                this.#data[ Math.floor( number / 30 ) ] |= mask;
        }

        /**
         * Get is prime number mark from field for number
         * @param {number} number 
         * @returns {boolean} if number is marked as prime number
         */
        get( number ) {
            const mask = this.#mask[ number % 30 ];
            if ( mask != 0 && this.#data[ Math.floor( number / 30 ) ] & mask != 0 )
                return true;
            return false;
        }
    }
}

