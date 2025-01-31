package mysql

// Framework code is generated by the generator.

import (
	"testing"

	"github.com/bytebase/bytebase/plugin/advisor"
)

func TestColumRequireDefault(t *testing.T) {
	tests := []advisor.TestCase{
		{
			Statement: `CREATE TABLE t(a int primary key, b int default 1)`,
			Want: []advisor.Advice{
				{
					Status:  advisor.Success,
					Code:    advisor.Ok,
					Title:   "OK",
					Content: "",
				},
			},
		},
		{
			Statement: `
				CREATE TABLE t(
					a int,
					b int default 1
				)`,
			Want: []advisor.Advice{
				{
					Status:  advisor.Warn,
					Code:    advisor.NoDefault,
					Title:   "column.require-default",
					Content: "Column `t`.`a` doesn't have DEFAULT.",
					Line:    3,
				},
			},
		},
		{
			Statement: `
				ALTER TABLE tech_book ADD COLUMN a BLOB;
				ALTER TABLE tech_book ADD COLUMN b timestamp;
				ALTER TABLE tech_book MODIFY COLUMN a varchar(220);
				`,
			Want: []advisor.Advice{
				{
					Status:  advisor.Warn,
					Code:    advisor.NoDefault,
					Title:   "column.require-default",
					Content: "Column `tech_book`.`b` doesn't have DEFAULT.",
					Line:    3,
				},
				{
					Status:  advisor.Warn,
					Code:    advisor.NoDefault,
					Title:   "column.require-default",
					Content: "Column `tech_book`.`a` doesn't have DEFAULT.",
					Line:    4,
				},
			},
		},
	}

	advisor.RunSQLReviewRuleTests(t, tests, &ColumRequireDefaultAdvisor{}, &advisor.SQLReviewRule{
		Type:    advisor.SchemaRuleColumnRequireDefault,
		Level:   advisor.SchemaRuleLevelWarning,
		Payload: "",
	}, advisor.MockMySQLDatabase)
}
