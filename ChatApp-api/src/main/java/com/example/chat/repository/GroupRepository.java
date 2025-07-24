package com.example.chat.repository;

import com.example.chat.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query(value = "SELECT g.* FROM chat_group_table g " +
            "JOIN group_members gm ON g.id = gm.group_id " +
            "WHERE gm.user_id = :userId", nativeQuery = true)
    List<Group> findGroupsByUserId(@Param("userId") Long userId);

}
