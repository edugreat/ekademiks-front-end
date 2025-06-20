package com.edugreat.akademiksresource.chat.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import com.edugreat.akademiksresource.chat.model.GroupChat;
import com.edugreat.akademiksresource.chat.projection.GroupChatInfo;

@Repository
@RestResource(exported = false)
public interface GroupChatDao extends JpaRepository<GroupChat, Integer> {

	@Query("SELECT gc FROM GroupChat gc JOIN gc.groupMembers gm WHERE gm.member.id =:studentId")
	List<GroupChatInfo> getGroupInfo(Integer studentId);


	@Query("SELECT g.groupAdminId FROM GroupChat g WHERE g.id =:groupId")
	Integer getAdminId(Integer groupId);


}
