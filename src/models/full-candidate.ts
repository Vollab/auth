import { Candidate } from './candidate'
import { User } from './user'

import { database } from 'common/services'

export interface FullCandidate extends User, Candidate {}

export interface FullCandidateWithActivityAreas extends FullCandidate {
	activity_areas: string[]
}

class FullCandidateModel {
	constructor(private db: typeof database) {}

	async findAllWithActivityAreas() {
		return this.db.query<FullCandidateWithActivityAreas>(
			`
			SELECT
				*
			FROM
				auth.full_candidate c
			LEFT JOIN (
				SELECT
					candidate_id id, array_agg(name) activity_areas
				FROM
					auth.candidate_area
				JOIN
					auth.activity_area
				ON
					id = activity_area_id
				GROUP BY
					candidate_id
			) a
			USING (id)
			;`
		)
	}

	async findByIdWithActivityAreas(id: FullCandidate['id']) {
		return this.db.query<FullCandidateWithActivityAreas>(
			`
			SELECT
				*
			FROM
				auth.full_candidate c
			LEFT JOIN LATERAL (
				SELECT
					candidate_id id, array_agg(name) activity_areas
				FROM
					auth.candidate_area
				JOIN
					auth.activity_area a
				ON
					a.id = activity_area_id
				WHERE
					c.id = candidate_id
				GROUP BY
					candidate_id
			) a
			USING (id)
			LEFT JOIN LATERAL (
				SELECT
					user_id id, array_agg(json_build_object('id', id, 'url', url, 'text', text)) links
				FROM
					auth.link
				WHERE
					c.id = user_id
				GROUP BY
					user_id
			) l
			USING (id)
			WHERE
				id = $1
			;`,
			[id]
		)
	}

	async findByEmail(email: FullCandidate['email']) {
		return this.db.query<FullCandidate>(
			`
			SELECT
				*
			FROM
				auth.full_candidate
			WHERE
				email = $1
			LIMIT
				1
			;`,
			[email]
		)
	}
}

export const full_candidate_model = new FullCandidateModel(database)
