import { param } from 'express-validator'
import express from 'express'

import { full_candidate_model, full_orderer_model, user_model } from '../models'

import { require_auth, validate_request } from 'common/middlewares'
import { NotFoundError } from 'common/errors'

const router = express.Router()

router.get('/api/current-user', require_auth(['candidate', 'orderer']), async (req, res) => {
	const user_id = req.current_user!.user_id

	const [user] = await user_model.findByIdWithRole(user_id)
	delete (user as any).password

	res.status(200).json({ user })
})

router.get('/api/users', require_auth(['candidate', 'orderer']), async (req, res) => {
	const users = await user_model.findAllWithRole()
	users.forEach(u => delete (u as any).password)

	res.status(200).json({ users })
})

router.get(
	'/api/users/:user_id',
	param('user_id', 'user id must be a valid UUID').isUUID().notEmpty(),
	validate_request,
	require_auth(['candidate', 'orderer']),
	async (req, res) => {
		const { user_id } = req.params

		const [user] = await user_model.findByIdWithRole(user_id)
		if (!user) throw new NotFoundError('User not found!')
		delete (user as any).password

		res.status(200).json({ user })
	}
)

router.get('/api/orderers', require_auth(['candidate', 'orderer']), async (req, res) => {
	const orderers = await full_orderer_model.findAll()
	orderers.forEach(o => delete (o as any).password)

	res.status(200).json({ orderers })
})

router.get(
	'/api/orderers/:orderer_id',
	param('orderer_id', 'orderer id must be a valid UUID').isUUID('all').notEmpty(),
	validate_request,
	require_auth(['candidate', 'orderer']),
	async (req, res) => {
		const { orderer_id } = req.params

		const [orderer] = await full_orderer_model.findById(orderer_id)
		if (!orderer) throw new NotFoundError('Orderer not found!')
		delete (orderer as any).password

		res.status(200).json({ orderer })
	}
)

router.get('/api/candidates', require_auth(['candidate', 'orderer']), async (req, res) => {
	const candidates = await full_candidate_model.findAllWithActivityAreas()
	candidates.forEach(c => delete (c as any).password)

	res.status(200).json({ candidates })
})

router.get(
	'/api/candidates/:candidate_id',
	param('candidate_id', 'candidate id must be a valid UUID').isUUID().notEmpty(),
	validate_request,
	require_auth(['candidate', 'orderer']),
	async (req, res) => {
		const { candidate_id } = req.params

		const [candidate] = await full_candidate_model.findByIdWithActivityAreas(candidate_id)
		if (!candidate) throw new NotFoundError('Candidate not found!')
		delete (candidate as any).password

		res.status(200).json({ candidate })
	}
)

export { router as find_all_user_router }
