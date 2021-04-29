import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  ApprovalForAll,
  MinterAdded,
  MinterRemoved,
  OwnershipTransferred,
  TransferBatch,
  TransferSingle,
  URI,
  WhitelistAdminAdded,
  WhitelistAdminRemoved
} from "../generated/Contract/Contract"
import { ExampleEntity } from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity._owner = event.params._owner
  entity._operator = event.params._operator

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.balanceOfBatch(...)
  // - contract.contractURI(...)
  // - contract.create(...)
  // - contract.creators(...)
  // - contract.isApprovedForAll(...)
  // - contract.isMinter(...)
  // - contract.isOwner(...)
  // - contract.isWhitelistAdmin(...)
  // - contract.maxSupply(...)
  // - contract.name(...)
  // - contract.owner(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenMaxSupply(...)
  // - contract.tokenSupply(...)
  // - contract.totalSupply(...)
  // - contract.uri(...)
}

export function handleMinterAdded(event: MinterAdded): void {}

export function handleMinterRemoved(event: MinterRemoved): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {}

export function handleURI(event: URI): void {}

export function handleWhitelistAdminAdded(event: WhitelistAdminAdded): void {}

export function handleWhitelistAdminRemoved(
  event: WhitelistAdminRemoved
): void {}
