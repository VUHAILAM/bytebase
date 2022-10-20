package mysql

// Framework code is generated by the generator.

import (
	"github.com/pingcap/tidb/parser/ast"

	"github.com/bytebase/bytebase/plugin/advisor"
	"github.com/bytebase/bytebase/plugin/advisor/db"
)

var (
	_ advisor.Advisor = (*StatementAffectedRowLimitAdvisor)(nil)
	_ ast.Visitor     = (*statementAffectedRowLimitChecker)(nil)
)

func init() {
	advisor.Register(db.MySQL, advisor.MySQLStatementAffectedRowLimit, &StatementAffectedRowLimitAdvisor{})
	advisor.Register(db.TiDB, advisor.MySQLStatementAffectedRowLimit, &StatementAffectedRowLimitAdvisor{})
}

// StatementAffectedRowLimitAdvisor is the advisor checking for UPDATE/DELETE affected row limit.
type StatementAffectedRowLimitAdvisor struct {
}

// Check checks for UPDATE/DELETE affected row limit.
func (*StatementAffectedRowLimitAdvisor) Check(ctx advisor.Context, statement string) ([]advisor.Advice, error) {
	stmtList, errAdvice := parseStatement(statement, ctx.Charset, ctx.Collation)
	if errAdvice != nil {
		return errAdvice, nil
	}

	level, err := advisor.NewStatusBySQLReviewRuleLevel(ctx.Rule.Level)
	if err != nil {
		return nil, err
	}
	payload, err := advisor.UnmarshalNumberTypeRulePayload(ctx.Rule.Payload)
	if err != nil {
		return nil, err
	}
	checker := &statementAffectedRowLimitChecker{
		level:  level,
		title:  string(ctx.Rule.Type),
		maxRow: payload.Number,
	}

	for _, stmt := range stmtList {
		checker.text = stmt.Text()
		checker.line = stmt.OriginTextPosition()
		(stmt).Accept(checker)
	}

	if len(checker.adviceList) == 0 {
		checker.adviceList = append(checker.adviceList, advisor.Advice{
			Status:  advisor.Success,
			Code:    advisor.Ok,
			Title:   "OK",
			Content: "",
		})
	}
	return checker.adviceList, nil
}

type statementAffectedRowLimitChecker struct {
	adviceList []advisor.Advice
	level      advisor.Status
	title      string
	text       string
	line       int
	maxRow     int
}

// Enter implements the ast.Visitor interface.
func (*statementAffectedRowLimitChecker) Enter(in ast.Node) (ast.Node, bool) {
	// TODO: implement it
	// switch node := in.(type) {
	// }

	return in, false
}

// Leave implements the ast.Visitor interface.
func (*statementAffectedRowLimitChecker) Leave(in ast.Node) (ast.Node, bool) {
	return in, true
}