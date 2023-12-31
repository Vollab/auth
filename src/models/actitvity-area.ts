import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface ActivityArea {
	id: string
	name: string
	updated_at: Date
	created_at: Date
}

class ActivityAreaModel {
	constructor(private db: typeof database) {}

	async findAll() {
		return this.db.query<ActivityArea>(
			`
			SELECT
				*
			FROM
				auth.activity_area
			;`
		)
	}

	async findById(id: ActivityArea['id']) {
		return this.db.query<ActivityArea>(
			`
			SELECT
				*
			FROM
				auth.activity_area
			WHERE
				id = $1
			LIMIT
				1
			;`,
			[id]
		)
	}

	async insert(activity_area: Omit<ActivityArea, 'id' | 'updated_at' | 'created_at'>) {
		const { name } = activity_area

		return this.db.query<ActivityArea>(
			`
			INSERT INTO
				auth.activity_area (name)
			VALUES
				($1)
			RETURNING
				*
			;`,
			[name]
		)
	}

	async update(id: ActivityArea['id'], activity_area: PartialOmit<ActivityArea, 'id' | 'updated_at' | 'created_at'>) {
		const entries = Object.entries(activity_area).filter(e => e[1] != null)
		if (entries.length === 0) return []
		const keys = entries.map((e, i) => `${e[0]} = $${i + 2}`)
		const values = entries.map(e => e[1])

		return this.db.query<ActivityArea>(
			`
			UPDATE
				auth.activity_area
			SET
				${keys.join(', ')}${keys.length !== 0 ? ',' : ''}
			WHERE
				id = $1
			RETURNING
				*
			;`,
			[id, ...values]
		)
	}
}

export const activity_area_model = new ActivityAreaModel(database)
