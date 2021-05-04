import {
	ethereum,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Account,
	TokenRegistry,
	Token,
	Balance,
	Transfer,
} from '../generated/schema'

import {
	ApprovalForAll as ApprovalForAllEvent,
	MinterAdded,
	MinterRemoved,
	OwnershipTransferred,
	TransferBatch  as TransferBatchEvent,
	TransferSingle as TransferSingleEvent,
	URI            as URIEvent,
	WhitelistAdminAdded,
	WhitelistAdminRemoved,
} from '../generated/Contract/Contract'

import { constants } from '../utils/constants'
import { events } from '../utils/events'
import { integers } from '../utils/integers'
import { transactions } from '../utils/transactions'

function fetchToken(registry: TokenRegistry, id: BigInt): Token {
	let tokenid = registry.id.concat('-').concat(id.toHex())
	let token = Token.load(tokenid)
	if (token == null) {
		token = new Token(tokenid)
		token.registry    = registry.id
		token.identifier  = id
		token.totalSupply = constants.BIGINT_ZERO
	}
	return token as Token
}

function fetchBalance(token: Token, account: Account): Balance {
	let balanceid = token.id.concat('-').concat(account.id)
	let balance = Balance.load(balanceid)
	if (balance == null) {
		balance = new Balance(balanceid)
		balance.token   = token.id
		balance.account = account.id
		balance.value   = constants.BIGINT_ZERO
	}
	return balance as Balance
}

function registerTransfer(
	event:    ethereum.Event,
	suffix:   String,
	registry: TokenRegistry,
	operator: Account,
	from:     Account,
	to:       Account,
	id:       BigInt,
	value:    BigInt)
: void
{
	let token = fetchToken(registry, id)
	let ev = new Transfer(events.id(event).concat(suffix.toString()))
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.token       = token.id
	ev.operator    = operator.id
	ev.from        = from.id
	ev.to          = to.id
	ev.value       = value

	if (from.id == constants.ADDRESS_ZERO) {
		token.totalSupply = integers.increment(token.totalSupply, value)
	} else {
		let balance = fetchBalance(token, from)
		balance.value = integers.decrement(balance.value, value)
		balance.save()
		ev.fromBalance = balance.id
	}

	if (to.id == constants.ADDRESS_ZERO) {
		token.totalSupply = integers.decrement(token.totalSupply, value)
	} else {
		let balance = fetchBalance(token, to)
		balance.value = integers.increment(balance.value, value)
		balance.save()
		ev.toBalance = balance.id
	}

	token.save()
	ev.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	// event.account
	// event.operator
	// event.approved
}

export function handleTransferSingle(event: TransferSingleEvent): void
{
	let registry = new TokenRegistry(event.address.toHex())
	let operator = new Account(event.params._operator.toHex())
	let from     = new Account(event.params._from.toHex())
	let to       = new Account(event.params._to.toHex())
	registry.save()
	operator.save()
	from.save()
	to.save()

	registerTransfer(
		event,
		"",
		registry,
		operator,
		from,
		to,
		event.params._id,
		event.params._amount
	)
}

export function handleTransferBatch(event: TransferBatchEvent): void
{
	let registry = new TokenRegistry(event.address.toHex())
	let operator = new Account(event.params._operator.toHex())
	let from     = new Account(event.params._from.toHex())
	let to       = new Account(event.params._to.toHex())
	registry.save()
	operator.save()
	from.save()
	to.save()

	let ids    = event.params._ids
	let values = event.params._amounts
	for (let i = 0;  i < ids.length; ++i)
	{
		registerTransfer(
			event,
			"-".concat(i.toString()),
			registry,
			operator,
			from,
			to,
			ids[i],
			values[i]
		)
	}
}


export function handleURI(event: URIEvent): void
{
	let registry = new TokenRegistry(event.address.toHex())
	registry.save()

	let token = fetchToken(registry, event.params._id)
	token.URI = event.params._uri
	token.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void
{
	//TODO
}

export function handleMinterAdded(event: MinterAdded): void
{
	//TODO
}

export function handleWhitelistAdminAdded(event: WhitelistAdminAdded): void
{
	//TODO
}

export function handleMinterRemoved(event: MinterRemoved): void
{
	//TODO
}

export function handleWhitelistAdminRemoved(event: WhitelistAdminRemoved): void
{
	//TODO
}