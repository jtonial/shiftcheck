<?php
//Do I need to encrypt at all? ie, will decryption ever be necessary? Or will hashing with a 
 //salt be sufficient? Hashing would add in alphanumeric values, but being able to keep a number 
 //as an INT may be better on database indexing
/**
 * Encrypt the passed parameter. Return the result (Blowfish encryption)
 */
function encrypt($a) {
}
/**
 * Decrypt the passed parameter. Return the result. (Blowfish encryption)
 */
function decrypt($a) {
}
/**
 * Hash with a salt.
 */
function myhash($a) {
	$s = 'schedule30082012';
	return sha1($a.$s);
}
?>
