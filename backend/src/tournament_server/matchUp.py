class MatchUps():
    def __init__(self, playerA, playerB):
        self.left = playerA
        self.right = playerB
        self.winner = None
        self.matchObject = None

    def getExpectedPlayers(self):
        return [self.left, self.right]

    def __str__(self) -> str:
        return f"L - {self.left} | R - {self.right}"

    def __repr__(self) -> str:
        return self.__str__()

    def getNodes(self):
        return self.left, self.right

    def getCurrentMatchUps(self):
        matchUps = []

        if (isinstance(self.left, MatchUps)):
            leftMatchUp = self.left.getCurrentMatchUps()
            rightMatchUp = self.right.getCurrentMatchUps()
            matchUps.extend(leftMatchUp)
            matchUps.extend(rightMatchUp)
        else:
            return [self]
        return matchUps

    def getMatchUpNode(self, expectedPlayers):
        if set(self.getExpectedPlayers()) == set(expectedPlayers):
            return self

        if (isinstance(self.left, MatchUps)):
            Lval = self.left.getMatchUpNode(expectedPlayers)
            if Lval:
                return Lval
        if (isinstance(self.right, MatchUps)):
            Rval = self.right.getMatchUpNode(expectedPlayers)
            if Rval:
                return Rval

        return False

    def setWinner(self, winner):
        self.winner = winner

    def setMatchObject(self, result):
        self.matchObject = result

    def getMatchObject(self):
        return self.matchObject

    def updateMatchUps(self):
        # "pull" the winner up
        def pullTheWinner(current, prev, side):
            if (isinstance(current.left, MatchUps)):
                pullTheWinner(current.left, current, 'L')
            if (isinstance(current.right, MatchUps)):
                pullTheWinner(current.right, current, 'R')

            if current.winner is not None:
                if (side == 'L'):
                    prev.left = current.winner
                elif (side == 'R'):
                    prev.right = current.winner

        pullTheWinner(self, None, None)

if __name__ == "__main__":
    test_node = MatchUps('a', 'b')
    test_node_b = MatchUps('c', 'd')
    test_node_c = MatchUps('e', 'f')
    test_node_d = MatchUps('g', 'h')

    sub_matchup = MatchUps(test_node, test_node_b)
    sub_matchup_a = MatchUps(test_node_c, test_node_d)

    test = MatchUps(sub_matchup, sub_matchup_a)
    print(test)
    print(test.getCurrentMatchUps())
    print(test.getMatchUpNode(['a', 'b']))
    print(test.getMatchUpNode(['c', 'd']))
    print(test.getMatchUpNode(['e', 'f']))
    print(test.getMatchUpNode(['g', 'h']))
    print(test.getMatchUpNode(['c', 'b']))
    test_node.setWinner('a')
    test_node_b.setWinner('d')
    test_node_c.setWinner('e')
    test_node_d.setWinner('g')
    test.updateMatchUps()
    print(test)
    sub_matchup.setWinner('a')
    sub_matchup_a.setWinner('e')
    test.updateMatchUps()
    print(test)